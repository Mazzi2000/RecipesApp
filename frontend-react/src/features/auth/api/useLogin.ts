import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { qk } from '@/lib/query/keys';
import { LoginResponseSchema, type LoginRequest } from '@/lib/api/schemas';

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginRequest) =>
      api('/auth/login', { method: 'POST', body: input }, LoginResponseSchema),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.auth });
    },
  });
}
