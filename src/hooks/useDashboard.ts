import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ApiResponse } from '@/types/entities';

// Get service provider dashboard data
export function useServiceProviderDashboard() {
    return useQuery({
        queryKey: ['service-provider-dashboard'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<any>>('/dashboard/service-provider');
            return response.data;
        },
    });
}

// Get purchaser dashboard data
export function usePurchaserDashboard() {
    return useQuery({
        queryKey: ['purchaser-dashboard'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<any>>('/dashboard/purchaser');
            return response.data;
        },
    });
}

// Get admin dashboard data
export function useAdminDashboard() {
    return useQuery({
        queryKey: ['admin-dashboard'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<any>>('/dashboard/admin');
            return response.data;
        },
    });
}
