import useApi from "../../apiHook";

export const useGetDashboardStats = () => {
    const { request, loading, error, data, clearError } = useApi();
    const getDashboardStats = async () => {
        const res = await request({
            url: "/dash/overview",
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
            url: `/dash/revenue?range=${range}`,
            method: "GET",
            withCredentials: true,
        });
        return res;
    };
    return { getRevenueStats, loading, error, data, clearError };
}

export const useGetJobsChart = () => {
    const { request, loading, error, data, clearError } = useApi();
    const getJobsChart = async (range: string) => {
        const res = await request({
            url: `/dash/jobs?range=${range}`,
            method: "GET",
            withCredentials: true,
        });
        return res;
    };
    return { getJobsChart, loading, error, data, clearError };
}

export const useGetFeesTrend = () => {
    const { request, loading, error, data, clearError } = useApi();
    const getFeesTrend = async (range: string) => {
        const res = await request({
            url: `/dash/fees?range=${range}`,
            method: "GET",
            withCredentials: true,
        });
        return res;
    };
    return { getFeesTrend, loading, error, data, clearError };
}