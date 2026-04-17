import { useEffect } from 'react';
import { useAdmin } from '../../context/admin/AdminContext';
import { getAdminProfile } from '../../api/admin.api.ts';

export const useLoadAdmin = () => {
  const { state, dispatch } = useAdmin();

  const loadAdmin = async () => {
    dispatch({ type: 'FETCH_START' });

    try {
      const res = await getAdminProfile();

      dispatch({ type: 'FETCH_SUCCESS', payload: res.data });
    } catch (err: any) {
      dispatch({
        type: 'FETCH_ERROR',
        payload: err?.message || 'Failed to load admin',
      });
    }
  };

  useEffect(() => {
    loadAdmin();
  }, []);

  return { state, loadAdmin };
};