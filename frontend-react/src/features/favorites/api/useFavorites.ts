import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { qk } from '@/lib/query/keys';
import { RecipeListResponseSchema, type RecipeListResponse } from '@/lib/api/schemas';
import { useAuth } from '@/features/auth/context/AuthContext';

export function useFavorites(page = 1) {
  const { isAuthenticated } = useAuth();
  return useQuery<RecipeListResponse>({
    queryKey: qk.favorites.list(page),
    queryFn: () =>
      api('/favorites', { query: { page, per_page: 20 } }, RecipeListResponseSchema),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  });
}
