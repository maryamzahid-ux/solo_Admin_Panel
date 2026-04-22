import useApi from "../hooks/apiHook";

export interface PlatformSettings {
    professionalCommission: number;
    customerSideFee: number;
    customerSideFeeEnabled: boolean;
    stripeProcessingFee: number;
    cancellationWindow: number;
    refundPolicy: 'FULL' | 'PARTIAL' | 'MANUAL';
    remindersEnabled: boolean;
    reminder24h: boolean;
    reminder1h: boolean;
}

export const useGetSettings = () => {
    const { loading, error, request, clearError } = useApi<PlatformSettings>();

    const getSettings = async () => {
        const res = await request({ url: '/setting', method: 'GET' });
        return res;
    };

    return { getSettings, loading, error, clearError };
};

export const useUpdateSettings = () => {
    const { loading, error, request, clearError } = useApi<PlatformSettings>();

    const updateSettings = async (data: Partial<PlatformSettings>) => {
        const res = await request({ 
            url: '/setting', 
            method: 'PATCH',
            data 
        });
        return res;
    };

    return { updateSettings, loading, error, clearError };
};

export const useResetSettings = () => {
    const { loading, error, request, clearError } = useApi<PlatformSettings>();

    const resetSettings = async () => {
        const res = await request({ 
            url: '/setting/reset', 
            method: 'POST'
        });
        return res;
    };

    return { resetSettings, loading, error, clearError };
};
