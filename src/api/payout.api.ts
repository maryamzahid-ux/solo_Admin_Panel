import useApi from "../hooks/apiHook";

export const useGetPayouts = () => {
    const { request, loading, error, data, clearError } = useApi();
    
    const getPayouts = async () => {
        const res = await request({
            url: "/payouts",
            method: "GET",
            withCredentials: true,
        });
        return res;
    };

    return { getPayouts, loading, error, data, clearError };
};

export const useUpdatePayoutStatus = () => {
    const { request, loading, error, data, clearError } = useApi();

    const updatePayoutStatus = async (id: string, status: 'approved' | 'declined') => {
        const res = await request({
            url: `/payouts/${id}`,
            method: "PATCH",
            data: { status },
            withCredentials: true,
        });
        return res;
    };

    return { updatePayoutStatus, loading, error, data, clearError };
};
