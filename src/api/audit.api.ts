import useApi from "../hooks/apiHook";

export interface AuditLog {
    id: string;
    action: string;
    description: string;
    entityType: string | null;
    entityId: string | null;
    actorType: string;
    actorId: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
    admin: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
    } | null;
}

export interface AuditSummary {
    totalActions: number;
    activeAdmins: number;
    latestActivity: string | null;
}

export interface AuditResponse {
    logs: AuditLog[];
    nextCursor: string | null;
    summary: AuditSummary;
}

export const useGetAuditLogs = () => {
    const { loading, error, request, clearError } = useApi<AuditResponse>();

    const getAuditLogs = async (params?: {
        cursor?: string;
        limit?: number;
        action?: string;
        entityType?: string;
        search?: string;
    }) => {
        const res = await request({ url: '/audit', method: 'GET', params });
        return res;
    };

    return { getAuditLogs, loading, error, clearError };
};
