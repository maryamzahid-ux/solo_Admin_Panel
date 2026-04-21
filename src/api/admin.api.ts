import useApi from "../hooks/apiHook";

export const useGetAdminProfile = () => {
    const { loading, error, request, clearError } = useApi();

    const getAdminProfile = async () => {
        const res = await request({ url: '/auth/profile', method: 'GET' });
        return res;
    };

    return { getAdminProfile, loading, error, clearError };
};