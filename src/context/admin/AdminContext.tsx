import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useGetAdminProfile } from '../../api/admin.api';
import { secureGetItem, secureSetItem, secureRemoveItem } from '../../utils/storage';

// ─── Types ───────────────────────────────────────────────────
export type Admin = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profile?: string; // Avatar URL
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
  const [admin, setAdmin] = useState<Admin | null>(() => secureGetItem('admin_data'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { getAdminProfile, error: profileError } = useGetAdminProfile();

  const loadAdmin = useCallback(async () => {
    // Only show loading if we don't have data already (prevent flicker on refresh)
    if (!admin) setLoading(true);
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
  }, [getAdminProfile, profileError, admin]);

  // Sync admin state to storage automatically
  useEffect(() => {
    if (admin) {
      secureSetItem('admin_data', admin);
    } else {
      // Clear storage on logout (when admin is null)
      secureRemoveItem('admin_data');
      secureRemoveItem('token');
    }
  }, [admin]);

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