import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api<{ message: string }>('/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
