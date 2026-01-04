import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PaymentSchedule, PaymentInstallment, ApiResponse } from '@/types/entities';
import { toast } from 'sonner';

export function useMyPayments() {
    return useQuery({
        queryKey: ['my-payments'],
        queryFn: async () => {
            // Backend returns array of { schedule, installments[] }
            const response = await api.get<ApiResponse<{ schedule: PaymentSchedule; installments: PaymentInstallment[] }[]>>('/payments/my-payments');
            return response.data;
        },
    });
}

export function usePaymentSchedule(plotId: string) {
    return useQuery({
        queryKey: ['payment-schedule', plotId],
        queryFn: async () => {
            const response = await api.get<ApiResponse<{
                schedules: { schedule: PaymentSchedule; installments: PaymentInstallment[] }[];
                progress: { totalPaid?: number; totalDue?: number; percentage?: number }
            }>>(`/payments/schedule/${plotId}`);
            return response.data;
        },
        enabled: !!plotId,
    });
}

export function usePaymentProgress(plotId: string) {
    return useQuery({
        queryKey: ['payment-progress', plotId],
        queryFn: async () => {
            const response = await api.get<ApiResponse<{ totalPaid?: number; totalDue?: number; percentage?: number }>>(`/payments/progress/${plotId}`);
            return response.data;
        },
        enabled: !!plotId,
    });
}

export function useMakePayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ installmentId, amount, proofFile }: { installmentId: string; amount: number; proofFile: File }) => {
            const formData = new FormData();
            formData.append('amountPaid', amount.toString());
            formData.append('paymentProof', proofFile);

            const response = await api.post<ApiResponse>(`/payments/${installmentId}/pay`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('[PAYMENT] Payment response:', response.data);
            console.log('[PAYMENT] Milestone data:', response.data.data?.milestone);

            // Check if milestone was reached in response
            if (response.data.data?.milestone) {
                // Trigger document generation for this milestone
                const { milestone } = response.data.data;
                try {
                    console.log('[MILESTONE] Notifying backend:', {
                        plotId: response.data.data.schedule?.plotId,
                        percentage: milestone.percentage,
                        documentType: milestone.documentType
                    });

                    const milestoneResponse = await api.post(`/payments/milestone-reached`, {
                        plotId: response.data.data.schedule?.plotId,
                        percentage: milestone.percentage,
                        amountPaid: amount,
                        documentType: milestone.documentType,
                    });

                    console.log('[MILESTONE] Backend response:', milestoneResponse.data);

                    if (!milestoneResponse.data.success) {
                        throw new Error(milestoneResponse.data.message || 'Backend failed to create milestone document');
                    }

                    // Invalidate document queries immediately
                    queryClient.invalidateQueries({ queryKey: ['milestone-documents'] });
                    queryClient.invalidateQueries({ queryKey: ['documents'] });

                } catch (err: any) {
                    // Log but don't fail the payment if milestone notification fails
                    console.error('[MILESTONE] Failed to notify milestone:', err);
                    toast.error(`Milestone notification failed: ${err.response?.data?.message || err.message}`);
                }
            }

            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-payments'] });
            queryClient.invalidateQueries({ queryKey: ['payment-schedule'] });
            queryClient.invalidateQueries({ queryKey: ['payment-progress'] });
            queryClient.invalidateQueries({ queryKey: ['plots'] });
            queryClient.invalidateQueries({ queryKey: ['milestone-documents'] });
        },
    });
}

// Service provider: Create payment schedule
export function useCreatePaymentSchedule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            plotId: string;
            installments: {
                installmentNumber: number;
                amount: number;
                dueDate: string;
            }[];
        }) => {
            const response = await api.post<ApiResponse<{ schedules: PaymentSchedule[] }>>('/payments/schedule', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payment-schedule'] });
            queryClient.invalidateQueries({ queryKey: ['plots'] });
        },
    });
}

// Service provider: Check and mark overdue payments
export function useCheckOverduePayments() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const response = await api.post<ApiResponse<PaymentInstallment[]>>('/payments/check-overdue');
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-payments'] });
            queryClient.invalidateQueries({ queryKey: ['payment-schedule'] });
        },
    });
}
