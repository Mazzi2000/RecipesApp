import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { qk } from '@/lib/query/keys';

export function useDeleteRecipes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) =>
      api<{ deleted: number }>('/recipes/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.recipes.all });
      void queryClient.invalidateQueries({ queryKey: qk.statistics });
      void queryClient.invalidateQueries({ queryKey: qk.favorites.all });
    },
  });
}
