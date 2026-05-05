import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/lib/api/client';
import { qk } from '@/lib/query/keys';
import { useAuth } from '@/features/auth/context/AuthContext';

const FavoriteIdsSchema = z.array(z.number());

export function useFavoriteIds() {
  const { isAuthenticated } = useAuth();
  return useQuery<number[]>({
    queryKey: qk.favorites.ids,
    queryFn: () => api('/favorites/ids', {}, FavoriteIdsSchema),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}
