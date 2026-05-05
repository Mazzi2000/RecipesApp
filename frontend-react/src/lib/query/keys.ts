export interface RecipeListFilters {
  category?: string | null;
  search?: string | null;
  tag?: string | null;
  page?: number;
  perPage?: number;
}

export const qk = {
  auth: ['auth'] as const,
  recipes: {
    all: ['recipes'] as const,
    list: (filters: RecipeListFilters) => ['recipes', 'list', filters] as const,
    detail: (id: number) => ['recipes', 'detail', id] as const,
  },
  recipeTags: ['recipe-tags'] as const,
  statistics: ['statistics'] as const,
  favorites: {
    all: ['favorites'] as const,
    ids: ['favorites', 'ids'] as const,
    list: (page: number) => ['favorites', 'list', page] as const,
  },
  mealPlan: (date: string) => ['meal-plan', date] as const,
};
