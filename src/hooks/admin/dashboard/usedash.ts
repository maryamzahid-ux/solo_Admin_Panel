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