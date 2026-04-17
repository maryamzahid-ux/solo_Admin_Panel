import { useEffect } from 'react';
import { useAdmin } from '../../context/admin/AdminContext';

export const useLoadAdmin = () => {
  const { admin, loading, error, loadAdmin } = useAdmin();

  useEffect(() => {
    loadAdmin();
  }, []);

  return { admin, loading, error, loadAdmin };
};