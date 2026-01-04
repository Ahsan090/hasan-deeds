import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ApiResponse, Plot } from '@/types/entities';

export interface MilestoneReachedData {
  plotId: string;
  percentage: number;
  amountPaid: number;
  documentType: string;
}

/**
 * Trigger document generation when a milestone is reached
 * Backend should handle: initiating document preparation and notification
 */
export function useMilestoneReached() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MilestoneReachedData) => {
      // This endpoint signals to backend that a milestone was reached
      // Backend will then initiate document preparation (UC-04 to UC-07)
      const response = await api.post<ApiResponse<{ success: boolean }>>(
        `/payments/milestone-reached`,
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['payment-schedule'] });
      queryClient.invalidateQueries({ queryKey: ['payment-progress'] });
      queryClient.invalidateQueries({ queryKey: ['plot', variables.plotId] });
    },
  });
}

/**
 * Generate a specific document at a milestone
 * Called automatically or manually by service provider
 */
export function useGenerateMilestoneDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      plotId: string;
      documentType: 'ALLOTMENT' | 'ALLOCATION' | 'POSSESSION' | 'CLEARANCE';
      milestone: number;
    }) => {
      const response = await api.post<ApiResponse<{ documentUri?: string; status: string }>>(
        `/documents/generate-milestone`,
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plot-documents', variables.plotId] });
      queryClient.invalidateQueries({ queryKey: ['plot', variables.plotId] });
    },
  });
}

/**
 * Get milestone progress for a plot
 */
export function useMilestoneProgress(plotId: string) {
  return useQueryClient().getQueryData(['payment-progress', plotId]);
}
