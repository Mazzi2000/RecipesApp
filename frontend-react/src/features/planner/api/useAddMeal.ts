import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { qk } from '@/lib/query/keys';
import type { MealType } from '@/lib/api/schemas';

interface AddMealInput {
  date: string;
  meal_type: MealType;
  recipe_id: number;
  servings: number;
}

export function useAddMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddMealInput) =>
      api<{ id: number }>('/meal-plans', { method: 'POST', body: input }),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: qk.mealPlan(vars.date) });
    },
  });
}
