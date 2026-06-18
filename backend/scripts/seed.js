require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'analytics',
  user: process.env.DB_USER || 'analytics_user',
  password: process.env.DB_PASSWORD || 'analytics_pass',
});

const DATA_DIR = path.join(__dirname, '../data');

async function seed() {
  const client = await pool.connect();
  console.log('Connected to PostgreSQL');

  try {
    await client.query('BEGIN');

    await client.query(`
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS products CASCADE;
      DROP TABLE IF EXISTS customers CASCADE;

      CREATE TABLE customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        city VARCHAR(100),
        region VARCHAR(50)
      );

      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        price NUMERIC(10,2) NOT NULL
      );

      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        customer_id INTEGER REFERENCES customers(id),
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        discount NUMERIC(4,2) DEFAULT 0,
        status VARCHAR(20) NOT NULL,
        region VARCHAR(50)
      );

      CREATE INDEX idx_orders_date ON orders(date);
      CREATE INDEX idx_orders_status ON orders(status);
      CREATE INDEX idx_orders_region ON orders(region);
    `);
    console.log('Tables created');

    const customers = parse(fs.readFileSync(path.join(DATA_DIR, 'customers.csv')), { columns: true, skip_empty_lines: true });
    for (const r of customers) {
      await client.query('INSERT INTO customers (id, name, email, city, region) VALUES ($1,$2,$3,$4,$5)', [r.id, r.name, r.email, r.city, r.region]);
    }
    await client.query(`SELECT setval('customers_id_seq', (SELECT MAX(id) FROM customers))`);
    console.log(`Inserted ${customers.length} customers`);

    const products = parse(fs.readFileSync(path.join(DATA_DIR, 'products.csv')), { columns: true, skip_empty_lines: true });
    for (const r of products) {
      await client.query('INSERT INTO products (id, name, category, price) VALUES ($1,$2,$3,$4)', [r.id, r.name, r.category, r.price]);
    }
    await client.query(`SELECT setval('products_id_seq', (SELECT MAX(id) FROM products))`);
    console.log(`Inserted ${products.length} products`);

    const orders = parse(fs.readFileSync(path.join(DATA_DIR, 'orders.csv')), { columns: true, skip_empty_lines: true });
    const BATCH = 200;
    for (let i = 0; i < orders.length; i += BATCH) {
      const batch = orders.slice(i, i + BATCH);
      const values = batch.map((_, idx) => {
        const b = idx * 9;
        return `($${b+1},$${b+2},$${b+3},$${b+4},$${b+5},$${b+6},$${b+7},$${b+8},$${b+9})`;
      }).join(',');
      const params = batch.flatMap(r => [r.id, r.date, r.customer_id, r.product_id, r.quantity, r.amount, r.discount, r.status, r.region]);
      await client.query(`INSERT INTO orders (id,date,customer_id,product_id,quantity,amount,discount,status,region) VALUES ${values}`, params);
    }
    await client.query(`SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders))`);
    console.log(`Inserted ${orders.length} orders`);

    await client.query('COMMIT');
    console.log('\nDatabase seeded successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(() => process.exit(1));
