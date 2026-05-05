import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { qk } from '@/lib/query/keys';

interface ToggleVars {
  recipeId: number;
  isFavorite: boolean;
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recipeId, isFavorite }: ToggleVars) =>
      api<{ message: string }>(
        `/favorites/${recipeId}`,
        { method: isFavorite ? 'DELETE' : 'POST' },
      ),
    onMutate: async ({ recipeId, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: qk.favorites.ids });
      const previous = queryClient.getQueryData<number[]>(qk.favorites.ids);
      queryClient.setQueryData<number[]>(qk.favorites.ids, (old = []) =>
        isFavorite ? old.filter((id) => id !== recipeId) : [...old, recipeId],
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(qk.favorites.ids, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: qk.favorites.ids });
      void queryClient.invalidateQueries({ queryKey: qk.favorites.all });
    },
  });
}
