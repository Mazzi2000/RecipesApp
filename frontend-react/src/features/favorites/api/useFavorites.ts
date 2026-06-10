import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { qk } from '@/lib/query/keys';
import { RecipeListResponseSchema, type RecipeListResponse } from '@/lib/api/schemas';
import { useAuth } from '@/features/auth/context/AuthContext';

interface FavoriteFilters {
  page?: number;
  search?: string | null;
  tag?: string | null;
}

export function useFavorites({ page = 1, search = null, tag = null }: FavoriteFilters = {}) {
  const { isAuthenticated } = useAuth();
  return useQuery<RecipeListResponse>({
    queryKey: qk.favorites.list({ page, search, tag }),
    queryFn: () =>
      api(
        '/favorites',
        { query: { page, per_page: 20, search: search ?? undefined, tag: tag ?? undefined } },
        RecipeListResponseSchema,
      ),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  });
}
