import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import { useRecipes } from '@/features/recipes/api/useRecipes';
import { useStatistics } from '@/features/recipes/api/useStatistics';
import { useAuth } from '@/features/auth/context/AuthContext';
import { RecipeGrid } from '@/features/recipes/components/RecipeGrid';
import { SearchBar } from '@/features/recipes/components/SearchBar';
import { TagFilter } from '@/features/recipes/components/TagFilter';
import { AddRecipeDialog } from '@/features/recipes/components/AddRecipeDialog';

export function RecipesPage() {
  const { t } = useTranslation();
  const { isAuthenticated, openLogin } = useAuth();
  useScrollRestoration();

  const [params, setParams] = useSearchParams();

  const filters = useMemo(
    () => ({
      search: params.get('search') ?? '',
      tag: params.get('tag') ?? '',
      page: Number(params.get('page') ?? '1') || 1,
    }),
    [params],
  );

  const setParam = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(params);
      for (const [key, value] of Object.entries(updates)) {
        if (value == null || value === '') next.delete(key);
        else next.set(key, value);
      }
      // changing filter resets page
      setParams(next, { replace: false });
    },
    [params, setParams],
  );

  const recipesQuery = useRecipes({
    search: filters.search || null,
    tag: filters.tag || null,
    page: filters.page,
  });
  const statsQuery = useStatistics();

  const totalRecipes = statsQuery.data ?? recipesQuery.data?.total;

  if (!isAuthenticated) {
    return (
      <EmptyState
        title={t('auth.loginRequired')}
        action={
          <Button onClick={openLogin} className="mt-4">
            {t('auth.login')}
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {totalRecipes != null && (
            <>
              {t('recipes.recipeCount')}: <strong className="text-foreground">{totalRecipes}</strong>
            </>
          )}
        </div>
        <AddRecipeDialog
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4" />
              {t('nav.addRecipe')}
            </Button>
          }
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <SearchBar
          value={filters.search}
          onChange={(v) => setParam({ search: v || null, page: null })}
        />
        <TagFilter
          value={filters.tag}
          onChange={(v) => setParam({ tag: v, page: null })}
        />
      </div>

      {recipesQuery.isError ? (
        <EmptyState
          title={t('errors.loadingRecipes')}
          description={recipesQuery.error instanceof Error ? recipesQuery.error.message : undefined}
        />
      ) : recipesQuery.data && recipesQuery.data.recipes.length === 0 ? (
        <EmptyState title={t('recipes.noRecipesFound')} />
      ) : (
        <RecipeGrid
          recipes={recipesQuery.data?.recipes ?? []}
          isLoading={recipesQuery.isLoading}
        />
      )}

      {recipesQuery.data && (
        <Pagination
          page={recipesQuery.data.page}
          totalPages={recipesQuery.data.total_pages}
          onChange={(p) => setParam({ page: String(p) })}
        />
      )}
    </div>
  );
}
