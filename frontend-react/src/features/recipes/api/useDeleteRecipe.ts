import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { qk } from '@/lib/query/keys';

export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api<{ message: string }>(`/recipes/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.recipes.all });
      void queryClient.invalidateQueries({ queryKey: qk.statistics });
      void queryClient.invalidateQueries({ queryKey: qk.favorites.all });
    },
  });
}
