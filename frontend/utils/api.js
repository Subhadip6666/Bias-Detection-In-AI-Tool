import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
                     (process.env.NODE_ENV === 'production' 
                      ? 'https://your-backend-url.render.com' 
                      : 'http://localhost:10000');

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const uploadDataset = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload', formData);
  return response.data;
};

export const loadDemoDataset = async () => {
  const response = await api.post('/load_demo');
  return response.data;
};

export const trainModel = async (datasetId, modelType, targetCol) => {
  const formData = new FormData();
  formData.append('dataset_id', datasetId);
  formData.append('model_type', modelType);
  formData.append('target_col', targetCol);
  const response = await api.post('/train', formData);
  return response.data;
};

export const analyzeBias = async (datasetId, modelId, protectedAttr) => {
  const formData = new FormData();
  formData.append('dataset_id', datasetId);
  formData.append('model_id', modelId);
  formData.append('protected_attr', protectedAttr);
  const response = await api.post('/analyze', formData);
  return response.data;
};

export const fixBias = async (datasetId, modelId, protectedAttr) => {
  const formData = new FormData();
  formData.append('dataset_id', datasetId);
  formData.append('model_id', modelId);
  formData.append('protected_attr', protectedAttr);
  const response = await api.post('/fix_bias', formData);
  return response.data;
};

export const getFeatureImportance = async (modelId) => {
  const response = await api.get(`/feature_importance/${modelId}`);
  return response.data;
};

export const getDatasetRows = async (datasetId, filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await api.get(`/dataset_rows/${datasetId}?${params}`);
  return response.data;
};

export const predictSingle = async (modelId, features) => {
  const response = await api.post('/predict', { model_id: modelId, features });
  return response.data;
};

export const generateReport = async (modelId, metrics, explanation) => {
  const formData = new FormData();
  formData.append('model_id', modelId);
  formData.append('metrics_json', JSON.stringify(metrics));
  formData.append('explanation', explanation);
  const response = await api.post('/report', formData);
  return response.data;
};

export default api;
