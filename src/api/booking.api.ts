import useApi from "../hooks/apiHook";

export interface Booking {
    id: string;
    serviceId: string;
    customerId: string;
    professionalId: string;
    status: string;
    paymentStatus: string;
    date: string;
    time: string;
    price: number;
    currency: string;
    cancelReason?: string;
    service: {
        name: string;
    };
    customer: {
        firstName: string;
        lastName: string;
        email?: string;
        number?: string;
        avatar?: string;
    };
    professional: {
        firstName: string;
        lastName: string;
        email?: string;
        number?: string;
        avatar?: string;
    };
    createdAt: string;
    description?: string;
    note?: string;
}

export interface BookingResponse {
    bookings: Booking[];
    nextCursor: string | null;
    totalCount: number;
    summary: {
        total: number;
        inDispute: number;
        completed: number;
        noShow: number;
    };
}

export const useGetBookings = () => {
    const { loading, error, request, clearError } = useApi<BookingResponse>();

    const getBookings = async (params: {
        status?: string,
        paymentStatus?: string,
        search?: string,
        cursor?: string,
        limit?: number
    }) => {
        const res = await request({ url: '/bookings', method: 'GET', params });
        return res;
    };

    return { getBookings, loading, error, clearError };
};

export const useGetBookingDetails = () => {
    const { loading, error, request, clearError } = useApi<{ booking: any }>();

    const getBookingDetails = async (bookingId: string) => {
        const res = await request({ url: `/bookings/${bookingId}`, method: 'GET' });
        return res;
    };

    return { getBookingDetails, loading, error, clearError };
};

export const useUpdateBookingStatus = () => {
    const { loading, error, request, clearError } = useApi();

    const updateBookingStatus = async (bookingId: string, status: string) => {
        const res = await request({ url: `/bookings/${bookingId}/status`, method: 'PATCH', data: { status } });
        return res;
    };

    return { updateBookingStatus, loading, error, clearError };
};

export const useUpdateBookingNote = () => {
    const { loading, error, request, clearError } = useApi();

    const updateBookingNote = async (bookingId: string, note: string) => {
        const res = await request({ url: `/bookings/${bookingId}/note`, method: 'PATCH', data: { note } });
        return res;
    };

    return { updateBookingNote, loading, error, clearError };
};

/** HOLD | RELEASE | REFUND */
export const useAdminPaymentAction = () => {
    const { loading, error, request, clearError } = useApi();

    const performPaymentAction = async (bookingId: string, action: 'HOLD' | 'RELEASE' | 'REFUND') => {
        const res = await request({
            url: `/bookings/${bookingId}/payment-action`,
            method: 'POST',
            data: { action }
        });
        return res;
    };

    return { performPaymentAction, loading, error, clearError };
};

/** Record no-show: party = 'CUSTOMER' | 'PROFESSIONAL' */
export const useHandleNoShow = () => {
    const { loading, error, request, clearError } = useApi();

    const handleNoShow = async (bookingId: string, party: 'CUSTOMER' | 'PROFESSIONAL') => {
        const res = await request({
            url: `/bookings/${bookingId}/no-show`,
            method: 'POST',
            data: { party }
        });
        return res;
    };

    return { handleNoShow, loading, error, clearError };
};

/** Mark booking as In Dispute */
export const useMarkInDispute = () => {
    const { loading, error, request, clearError } = useApi();

    const markInDispute = async (bookingId: string, reason: string) => {
        const res = await request({
            url: `/bookings/${bookingId}/dispute`,
            method: 'POST',
            data: { reason }
        });
        return res;
    };

    return { markInDispute, loading, error, clearError };
};
