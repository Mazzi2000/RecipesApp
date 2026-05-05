import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFavorites } from '@/features/favorites/api/useFavorites';
import { RecipeGrid } from '@/features/recipes/components/RecipeGrid';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';

export function FavoritesPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useFavorites(page);

  if (isError) {
    return <EmptyState title={t('errors.loadingFavorites')} />;
  }

  if (!isLoading && data?.total === 0) {
    return <EmptyState title={t('favorites.noFavorites')} />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">{t('favorites.title')}</h2>
      <RecipeGrid recipes={data?.recipes ?? []} isLoading={isLoading} />
      {data && data.total_pages > 1 && (
        <Pagination
          page={data.page}
          totalPages={data.total_pages}
          onChange={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
          }}
        />
      )}
    </div>
  );
}
