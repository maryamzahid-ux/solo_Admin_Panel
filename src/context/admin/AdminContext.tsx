import { createContext, useContext, useState, useCallback } from 'react';
import { useGetAdminProfile } from '../../api/admin.api';

// ─── Types ───────────────────────────────────────────────────
export type Admin = {
  id: string;
  name: string;
  email: string;
};

type AdminContextValue = {
  admin: Admin | null;
  loading: boolean;
  error: string;
  loadAdmin: () => Promise<void>;
  setAdmin: (admin: Admin | null) => void;
  clearAdmin: () => void;
};

// ─── Context ─────────────────────────────────────────────────
const AdminContext = createContext<AdminContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────
export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { getAdminProfile, error: profileError } = useGetAdminProfile();

  const loadAdmin = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminProfile();
      if (res && res.success) {
        const adminData = res.data.admin || res.data;
        setAdmin(adminData);
      } else {
        setError(profileError || 'Failed to load admin profile');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load admin');
    } finally {
      setLoading(false);
    }
  }, [getAdminProfile, profileError]);

  const clearAdmin = useCallback(() => {
    setAdmin(null);
    setError('');
  }, []);

  return (
    <AdminContext.Provider
      value={{ admin, loading, error, loadAdmin, setAdmin, clearAdmin }}
    >
      {children}
    </AdminContext.Provider>
  );
};

// ─── Hook ────────────────────────────────────────────────────
// eslint-disable-next-line react-refresh/only-export-components
export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within <AdminProvider>');
  return ctx;
};