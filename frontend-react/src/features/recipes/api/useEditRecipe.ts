import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { qk } from '@/lib/query/keys';
import type { CreateRecipeInput } from '@/lib/api/schemas';

interface EditRecipeVars {
  id: number;
  data: CreateRecipeInput;
}

export function useEditRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: EditRecipeVars) =>
      api<{ id: number; message: string }>(`/recipes/${id}`, { method: 'PUT', body: data }),
    onSuccess: (_result, vars) => {
      void queryClient.invalidateQueries({ queryKey: qk.recipes.all });
      void queryClient.invalidateQueries({ queryKey: qk.recipes.detail(vars.id) });
      void queryClient.invalidateQueries({ queryKey: qk.favorites.all });
    },
  });
}
