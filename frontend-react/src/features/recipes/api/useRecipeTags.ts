import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { qk } from '@/lib/query/keys';
import { RecipeTagsSchema } from '@/lib/api/schemas';

export function useRecipeTags() {
  return useQuery<string[]>({
    queryKey: qk.recipeTags,
    queryFn: () => api('/recipe-tags', {}, RecipeTagsSchema),
  });
}
