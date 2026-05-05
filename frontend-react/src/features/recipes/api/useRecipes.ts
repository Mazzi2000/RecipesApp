import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { qk, type RecipeListFilters } from '@/lib/query/keys';
import { RecipeListResponseSchema, type RecipeListResponse } from '@/lib/api/schemas';

const DEFAULT_PER_PAGE = 20;

export function useRecipes(filters: RecipeListFilters) {
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? DEFAULT_PER_PAGE;

  return useQuery<RecipeListResponse>({
    queryKey: qk.recipes.list({ ...filters, page, perPage }),
    queryFn: () =>
      api(
        '/recipes',
        {
          query: {
            category: filters.category ?? undefined,
            search: filters.search ?? undefined,
            tag: filters.tag ?? undefined,
            page,
            per_page: perPage,
          },
        },
        RecipeListResponseSchema,
      ),
    placeholderData: (prev) => prev,
  });
}
