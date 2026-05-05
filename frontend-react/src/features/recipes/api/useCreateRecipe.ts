import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { qk } from '@/lib/query/keys';
import type { CreateRecipeInput } from '@/lib/api/schemas';

export function useCreateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRecipeInput) =>
      api<{ id: number; message: string }>('/recipes', { method: 'POST', body: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.recipes.all });
      void queryClient.invalidateQueries({ queryKey: qk.statistics });
      void queryClient.invalidateQueries({ queryKey: qk.recipeTags });
    },
  });
}
