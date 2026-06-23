import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import { useRecipes } from '@/features/recipes/api/useRecipes';
import { useStatistics } from '@/features/recipes/api/useStatistics';
import { useDeleteRecipes } from '@/features/recipes/api/useDeleteRecipes';
import { useAuth } from '@/features/auth/context/AuthContext';
import { RecipeGrid } from '@/features/recipes/components/RecipeGrid';
import { SearchBar } from '@/features/recipes/components/SearchBar';
import { TagFilter } from '@/features/recipes/components/TagFilter';
import { AddRecipeDialog } from '@/features/recipes/components/AddRecipeDialog';

export function RecipesPage() {
  const { t } = useTranslation();
  const { isAuthenticated, openLogin } = useAuth();
  useScrollRestoration();

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const bulkDelete = useDeleteRecipes();

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
  const pageRecipes = recipesQuery.data?.recipes ?? [];

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allOnPageSelected =
    pageRecipes.length > 0 && pageRecipes.every((r) => selectedIds.has(r.id));

  const toggleSelectAll = useCallback(() => {
    setSelectedIds(allOnPageSelected ? new Set() : new Set(pageRecipes.map((r) => r.id)));
  }, [allOnPageSelected, pageRecipes]);

  const exitSelectMode = useCallback(() => {
    setIsSelectMode(false);
    setSelectedIds(new Set());
  }, []);

  const onBulkDelete = async () => {
    try {
      await bulkDelete.mutateAsync([...selectedIds]);
      toast.success(t('toast.recipeDeleted'));
      setConfirmOpen(false);
      exitSelectMode();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.deletingRecipe'));
    }
  };

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
        <div className="flex gap-2">
          {isSelectMode ? (
            <Button size="sm" variant="ghost" onClick={exitSelectMode}>
              {t('recipes.cancelSelect')}
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setIsSelectMode(true)}>
              {t('recipes.selectMode')}
            </Button>
          )}
          <AddRecipeDialog
            trigger={
              <Button size="sm">
                <Plus className="h-4 w-4" />
                {t('nav.addRecipe')}
              </Button>
            }
          />
        </div>
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

      {isSelectMode && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={allOnPageSelected}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded"
            />
            {t('recipes.selectAll')}
          </label>
          <span className="text-sm text-muted-foreground">
            {t('recipes.selectedCount', { count: selectedIds.size })}
          </span>
          <Button
            size="sm"
            variant="destructive"
            className="ml-auto"
            disabled={selectedIds.size === 0}
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            {t('recipes.deleteSelected')}
          </Button>
        </div>
      )}

      {recipesQuery.isError ? (
        <EmptyState
          title={t('errors.loadingRecipes')}
          description={recipesQuery.error instanceof Error ? recipesQuery.error.message : undefined}
        />
      ) : recipesQuery.data && recipesQuery.data.recipes.length === 0 ? (
        <EmptyState title={t('recipes.noRecipesFound')} />
      ) : (
        <RecipeGrid
          recipes={pageRecipes}
          isLoading={recipesQuery.isLoading}
          isSelectMode={isSelectMode}
          selectedIds={selectedIds}
          onToggle={toggleSelect}
        />
      )}

      {recipesQuery.data && (
        <Pagination
          page={recipesQuery.data.page}
          totalPages={recipesQuery.data.total_pages}
          onChange={(p) => setParam({ page: String(p) })}
        />
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('recipes.deleteSelected')}</DialogTitle>
            <DialogDescription>
              {t('recipes.bulkDeleteConfirm', { count: selectedIds.size })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              {t('buttons.cancel')}
            </Button>
            <Button variant="destructive" onClick={onBulkDelete} disabled={bulkDelete.isPending}>
              {bulkDelete.isPending ? t('deleteModal.deleting') : t('recipes.deleteSelected')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
