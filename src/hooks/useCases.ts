import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { FailedPayment, ApiResponse } from '@/types/entities';

// Get all cases
export function useCases(filters?: { status?: string; plotId?: string }) {
    return useQuery({
        queryKey: ['cases', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters?.status) params.append('status', filters.status);
            if (filters?.plotId) params.append('plotId', filters.plotId);

            const response = await api.get<ApiResponse<FailedPayment[]>>(`/cases?${params.toString()}`);
            return response.data;
        },
    });
}

// Get cases with expired grace period
export function useGracePeriodExpiredCases() {
    return useQuery({
        queryKey: ['cases-grace-expired'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<FailedPayment[]>>('/cases/grace-period-expired');
            return response.data;
        },
    });
}

// Get single case
export function useCase(caseId: string) {
    return useQuery({
        queryKey: ['case', caseId],
        queryFn: async () => {
            const response = await api.get<ApiResponse<FailedPayment>>(`/cases/${caseId}`);
            return response.data;
        },
        enabled: !!caseId,
    });
}

// Record failed payment
export function useRecordFailedPayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            plotId: string;
            amount: number;
            description: string;
            gracePeriodDays?: number;
        }) => {
            const response = await api.post<ApiResponse<FailedPayment>>('/cases/failed-payment', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cases'] });
        },
    });
}

// File a case
export function useFileCase() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            failedPaymentId,
            data,
        }: {
            failedPaymentId: string;
            data: {
                courtDate: string;
                chargeCode: string;
                amountCharged: number;
                description: string;
            };
        }) => {
            const response = await api.post<ApiResponse<any>>(
                `/cases/${failedPaymentId}/file`,
                data
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cases'] });
            queryClient.invalidateQueries({ queryKey: ['cases-grace-expired'] });
        },
    });
}

// Update case status
export function useUpdateCaseStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            caseId,
            status,
            description,
        }: {
            caseId: string;
            status: 'recorded' | 'filed' | 'in_progress' | 'resolved' | 'closed';
            description?: string;
        }) => {
            const response = await api.put<ApiResponse<FailedPayment>>(
                `/cases/${caseId}/status`,
                { status, description }
            );
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['cases'] });
            queryClient.invalidateQueries({ queryKey: ['case', variables.caseId] });
        },
    });
}
