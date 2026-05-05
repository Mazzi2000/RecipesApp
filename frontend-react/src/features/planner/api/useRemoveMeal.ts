import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { qk } from '@/lib/query/keys';

interface RemoveVars {
  mealId: number;
  date: string;
}

export function useRemoveMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mealId }: RemoveVars) =>
      api<{ message: string }>(`/meal-plans/${mealId}`, { method: 'DELETE' }),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: qk.mealPlan(vars.date) });
    },
  });
}
