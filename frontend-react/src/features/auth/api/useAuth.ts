import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { qk } from '@/lib/query/keys';
import { AuthMeSchema, type AuthMe } from '@/lib/api/schemas';

export function useAuthQuery() {
  return useQuery<AuthMe>({
    queryKey: qk.auth,
    queryFn: () => api('/auth/me', {}, AuthMeSchema),
    staleTime: 60_000,
  });
}
