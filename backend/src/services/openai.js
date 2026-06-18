const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function buildSchemaContext(schemas) {
  const tables = {};
  for (const row of schemas) {
    if (!tables[row.table_name]) tables[row.table_name] = [];
    tables[row.table_name].push(`  ${row.column_name} ${row.data_type.toUpperCase()}${row.constraint_type === 'PRIMARY KEY' ? ' PRIMARY KEY' : ''}`);
  }
  return Object.entries(tables)
    .map(([table, cols]) => `CREATE TABLE ${table} (\n${cols.join(',\n')}\n);`)
    .join('\n\n');
}

async function generateSQL(question, schemas) {
  const schemaContext = buildSchemaContext(schemas);

  const systemPrompt = `You are an expert PostgreSQL analyst. Given a database schema and a natural language question, generate a precise, read-only SQL query (SELECT only).

Rules:
- Return ONLY the SQL query, no explanation or markdown
- Use proper PostgreSQL syntax
- Never use INSERT, UPDATE, DELETE, DROP, or DDL statements
- Use aliases for clarity
- For date comparisons use PostgreSQL functions: NOW(), CURRENT_DATE, DATE_TRUNC(), TO_CHAR(), INTERVAL
- For "last month" use: DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
- Limit results to 1000 rows unless the user asks for specific aggregations

Database schema:
${schemaContext}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question },
    ],
    temperature: 0,
    max_tokens: 500,
  });

  let sql = response.choices[0].message.content.trim();
  sql = sql.replace(/```sql\n?/gi, '').replace(/```\n?/g, '').trim();
  return sql;
}

async function generateInsight(question, sql, rows) {
  const sampleData = rows.slice(0, 10);
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a data analyst. Given a question, the SQL query used, and result data, provide a concise 1-2 sentence insight about what the data shows. Be specific with numbers.',
      },
      {
        role: 'user',
        content: `Question: ${question}\nSQL: ${sql}\nResults (sample): ${JSON.stringify(sampleData)}\nTotal rows: ${rows.length}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 150,
  });
  return response.choices[0].message.content.trim();
}

module.exports = { generateSQL, generateInsight };
