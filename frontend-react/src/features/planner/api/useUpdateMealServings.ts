import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { qk } from '@/lib/query/keys';
import type { MealPlan } from '@/lib/api/schemas';

interface UpdateVars {
  mealId: number;
  servings: number;
  date: string;
}

export function useUpdateMealServings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mealId, servings }: UpdateVars) =>
      api(`/meal-plans/${mealId}`, {
        method: 'PATCH',
        body: { servings },
      }),
    onMutate: async (vars) => {
      const key = qk.mealPlan(vars.date);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MealPlan>(key);
      if (previous) {
        const next = recomputeMealPlan(previous, vars);
        queryClient.setQueryData(key, next);
      }
      return { previous, key };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous && context.key) {
        queryClient.setQueryData(context.key, context.previous);
      }
    },
    onSettled: (_data, _err, vars) => {
      void queryClient.invalidateQueries({ queryKey: qk.mealPlan(vars.date) });
    },
  });
}

function recomputeMealPlan(plan: MealPlan, vars: UpdateVars): MealPlan {
  const meals = plan.meals.map((m) =>
    m.id === vars.mealId ? { ...m, servings: vars.servings } : m,
  );
  const totals = meals.reduce(
    (acc, m) => {
      const factor = m.servings ?? 1;
      acc.calories += (m.calories_per_serving ?? 0) * factor;
      acc.protein += (m.protein_per_serving ?? 0) * factor;
      acc.fat += (m.fat_per_serving ?? 0) * factor;
      acc.carbs += (m.carbs_per_serving ?? 0) * factor;
      return acc;
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 },
  );
  return { ...plan, meals, totals };
}
