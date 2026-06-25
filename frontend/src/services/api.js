import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export async function runQuery(question, tableId = null) {
  const { data } = await api.post('/query', { question, tableId });
  return data;
}

export async function fetchSchema() {
  const { data } = await api.get('/schema');
  return data;
}

export async function uploadDataset(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteDataset(tableId) {
  await api.delete(`/upload/${tableId}`);
}

export async function fetchSuggestions(columns, fileName) {
  const { data } = await api.post('/suggestions', { columns, fileName });
  return data.suggestions;
}
