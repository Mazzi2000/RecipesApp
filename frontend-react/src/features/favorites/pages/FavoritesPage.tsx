import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFavorites } from '@/features/favorites/api/useFavorites';
import { RecipeGrid } from '@/features/recipes/components/RecipeGrid';
import { SearchBar } from '@/features/recipes/components/SearchBar';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';

export function FavoritesPage() {
  const { t } = useTranslation();
  useScrollRestoration();

  const [params, setParams] = useSearchParams();

  const filters = useMemo(
    () => ({
      search: params.get('search') ?? '',
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
      if ('search' in updates) next.delete('page');
      setParams(next, { replace: false });
    },
    [params, setParams],
  );

  const { data, isLoading, isError } = useFavorites({
    page: filters.page,
    search: filters.search || null,
  });

  if (isError) {
    return <EmptyState title={t('errors.loadingFavorites')} />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">{t('favorites.title')}</h2>

      <div className="grid gap-3 sm:max-w-md">
        <SearchBar
          value={filters.search}
          onChange={(v) => setParam({ search: v || null })}
        />
      </div>

      {!isLoading && data?.recipes.length === 0 && !filters.search ? (
        <EmptyState title={t('favorites.noFavorites')} />
      ) : !isLoading && data?.recipes.length === 0 ? (
        <EmptyState title={t('recipes.noRecipesFound')} />
      ) : (
        <RecipeGrid recipes={data?.recipes ?? []} isLoading={isLoading} />
      )}

      {data && data.total_pages > 1 && (
        <Pagination
          page={data.page}
          totalPages={data.total_pages}
          onChange={(p) => {
            setParam({ page: String(p) });
            window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
          }}
        />
      )}
    </div>
  );
}
