import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { qk } from '@/lib/query/keys';
import { MealPlanSchema, type MealPlan } from '@/lib/api/schemas';
import { useAuth } from '@/features/auth/context/AuthContext';

export function useMealPlan(date: string) {
  const { isAuthenticated } = useAuth();
  return useQuery<MealPlan>({
    queryKey: qk.mealPlan(date),
    queryFn: () => api('/meal-plans', { query: { date } }, MealPlanSchema),
    enabled: isAuthenticated && !!date,
  });
}
