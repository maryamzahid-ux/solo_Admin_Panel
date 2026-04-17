import useApi from "./apiHook";

export const useLogin = () => {
    const { request, loading, error, clearError } = useApi();
    const login = async (email: string, password: string) => {
        const res = await request({
            url: '/signin',
            method: 'POST',
            data: { email, password },
        });
        return res;
    };
    return { login, loading, error, clearError };
};

export const useChangePassword = () => {
    const { request, loading, error, clearError } = useApi();
    const changePassword = async (newPassword: string) => {
        const res = await request({
            url: '/change-password',
            method: 'POST',
            withCredentials: true,
            data: { newPassword },
        });
        return res;
    };
    return { changePassword, loading, error, clearError };
};

export const useLogout = () => {
    const { request, loading, error, clearError } = useApi();
    const logout = async () => {
        const res = await request({
            url: '/logout',
            method: 'POST',
            withCredentials: true,
        });
        return res;
    };
    return { logout, loading, error, clearError };
};

export const useForgotPassword = () => {
    const { request, loading, error, clearError } = useApi();
    const forgotPassword = async (email: string) => {
        const res = await request({
            url: '/forgot-password',
            method: 'POST',
            data: { email },
        });
        return res;
    };
    return { forgotPassword, loading, error, clearError };
};

export const useResetPassword = () => {
    const { request, loading, error, clearError } = useApi();
    const resetPassword = async (token: string, newPassword: string) => {
        const res = await request({
            url: '/reset-password',
            method: 'POST',
            data: { token, newPassword },
        });
        return res;
    };
    return { resetPassword, loading, error, clearError };
};