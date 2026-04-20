import useApi from "../../apiHook";

export const useGetDashboardStats = () => {
    const { request, loading, error, data, clearError } = useApi();
    const getDashboardStats = async () => {
        const res = await request({
            url: "/stats",
            method: "GET",
            withCredentials: true,
        });
        return res;
    };
    return { getDashboardStats, loading, error, data, clearError };
}


export const useGetRevenueStats = () => {
    const { request, loading, error, data, clearError } = useApi();
    const getRevenueStats = async (range: string) => {
        const res = await request({
            url: `/revenue-stats?range=${range}`,
            method: "GET",
            withCredentials: true,
        });
        return res;
    };
    return { getRevenueStats, loading, error, data, clearError };
}