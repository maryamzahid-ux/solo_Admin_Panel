import { useState, useCallback } from 'react';
import axios, { type AxiosRequestConfig, type AxiosError } from 'axios';
import { secureGetItem } from '../utils/storage';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = secureGetItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const useApi = <T = unknown>() => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>(''); // ✅ STRING ONLY

  const request = useCallback(async (options: AxiosRequestConfig) => {
    setLoading(true);
    setError('');

    try {
      const res = await apiClient(options);

      // ✅ handle API-level failure (success: false)
      if (res.data && res.data.success === false) {
        const msg = res.data.message || 'Something went wrong';
        setError(msg);
        return null;
      }

      setData(res.data);
      return res.data;

    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;

      // ✅ ALWAYS normalize to string
      const msg =
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Something went wrong';

      setError(msg);
      return null; // ❗ DO NOT throw (prevents crash)

    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  return { data, loading, error, request, clearError };
};

export default useApi;