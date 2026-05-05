import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { qk } from '@/lib/query/keys';
import { RecipeDetailSchema, type RecipeDetail } from '@/lib/api/schemas';

export function useRecipe(id: number | undefined) {
  return useQuery<RecipeDetail>({
    queryKey: id != null ? qk.recipes.detail(id) : ['recipe', 'invalid'],
    queryFn: () => api(`/recipes/${id}`, {}, RecipeDetailSchema),
    enabled: id != null && Number.isFinite(id),
  });
}
