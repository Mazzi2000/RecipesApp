import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { qk } from '@/lib/query/keys';
import { RecipeListResponseSchema, type RecipeListResponse } from '@/lib/api/schemas';
import { useAuth } from '@/features/auth/context/AuthContext';

interface FavoriteFilters {
  page?: number;
  search?: string | null;
}

export function useFavorites({ page = 1, search = null }: FavoriteFilters = {}) {
  const { isAuthenticated } = useAuth();
  return useQuery<RecipeListResponse>({
    queryKey: qk.favorites.list({ page, search }),
    queryFn: () =>
      api(
        '/favorites',
        { query: { page, per_page: 20, search: search ?? undefined } },
        RecipeListResponseSchema,
      ),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  });
}
