import useApi from "../hooks/apiHook";

export const useGetAdminProfile = () => {
    const { loading, error, request, clearError } = useApi();

    const getAdminProfile = async () => {
        const res = await request({ url: '/auth/profile', method: 'GET' });
        return res;
    };

    return { getAdminProfile, loading, error, clearError };
};

export const useGetUsers = () => {
    const { loading, error, request, clearError } = useApi();

    const getUsers = async (params: { role?: string, status?: string, search?: string, cursor?: string, limit?: number }) => {
        const res = await request({ url: '/users', method: 'GET', params });
        return res;
    };

    return { getUsers, loading, error, clearError };
};

export const useGetUserDetails = () => {
    const { loading, error, request, clearError } = useApi();

    const getUserDetails = async (userId: string) => {
        const res = await request({ url: `/users/${userId}`, method: 'GET' });
        return res;
    };

    return { getUserDetails, loading, error, clearError };
};

export const useUpdateUserStatus = () => {
    const { loading, error, request, clearError } = useApi();

    const updateUserStatus = async (userId: string, status: string) => {
        const res = await request({ url: `/users/${userId}/status`, method: 'PATCH', data: { status } });
        return res;
    };

    return { updateUserStatus, loading, error, clearError };
};

export const useUpdateAdminNotes = () => {
    const { loading, error, request, clearError } = useApi();

    const updateAdminNotes = async (userId: string, notes: string) => {
        const res = await request({ url: `/users/${userId}/notes`, method: 'PATCH', data: { notes } });
        return res;
    };

    return { updateAdminNotes, loading, error, clearError };
};