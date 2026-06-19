import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export async function runQuery(question) {
  const { data } = await api.post('/query', { question });
  return data;
}

export async function fetchSchema() {
  const { data } = await api.get('/schema');
  return data;
}
