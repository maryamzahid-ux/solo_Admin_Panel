import { useState, useCallback } from 'react';
import axios, { type AxiosRequestConfig, type AxiosError } from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const useApi = <T = any>() => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const request = useCallback(async (options: AxiosRequestConfig) => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiClient(options);
      setData(res.data);
      return res.data;
    } catch (err) {
      const axiosError = err as AxiosError<any>;
      setError(axiosError.response?.data || axiosError.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, request };
};

export default useApi;