import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useMealPlan } from '@/features/planner/api/useMealPlan';
import { useAddMeal } from '@/features/planner/api/useAddMeal';
import { useRemoveMeal } from '@/features/planner/api/useRemoveMeal';
import { useUpdateMealServings } from '@/features/planner/api/useUpdateMealServings';
import { useRecipes } from '@/features/recipes/api/useRecipes';
import { useDebounce } from '@/hooks/useDebounce';
import { MEAL_TYPES, type MealType, type MealItem } from '@/lib/api/schemas';
import { todayIso, shiftDate } from '@/lib/utils/format';

function formatDate(date: string) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const MEAL_EMOJIS: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '🌤️',
  dinner: '🌙',
  snack: '🍎',
};

export function PlannerPage() {
  const { t } = useTranslation();
  const [date, setDate] = useState(todayIso);
  const { data: plan, isLoading, isError } = useMealPlan(date);

  const mealsByType = MEAL_TYPES.reduce<Record<MealType, MealItem[]>>(
    (acc, type) => {
      acc[type] = plan?.meals.filter((m) => m.meal_type === type) ?? [];
      return acc;
    },
    {} as Record<MealType, MealItem[]>,
  );

  const isToday = date === todayIso();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setDate((d) => shiftDate(d, -1))}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-1 flex-col items-center">
          <span className="text-base font-semibold">{formatDate(date)}</span>
          {!isToday && (
            <button
              type="button"
              className="text-xs text-muted-foreground underline hover:text-foreground"
              onClick={() => setDate(todayIso())}
            >
              {t('nav.recipes') /* reuse – just "today" label */}
            </button>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={() => setDate((d) => shiftDate(d, 1))}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {isError && <EmptyState title={t('errors.loadingMealPlan')} />}
      {isLoading && <LoadingSpinner />}

      {!isLoading && !isError && (
        <>
          <div className="grid gap-4">
            {MEAL_TYPES.map((type) => (
              <MealSection key={type} mealType={type} meals={mealsByType[type]} date={date} />
            ))}
          </div>

          {plan && (
            <div className="rounded-lg border border-border p-4">
              <h3 className="mb-3 font-semibold">{t('mealPlan.dailySummary')}</h3>
              <div className="grid grid-cols-4 gap-2 text-center text-sm">
                <div>
                  <div className="text-xl font-bold">{Math.round(plan.totals.calories)}</div>
                  <div className="text-muted-foreground">{t('nutrition.kcal')}</div>
                </div>
                <div>
                  <div className="text-xl font-bold">{Math.round(plan.totals.protein)}g</div>
                  <div className="text-muted-foreground">{t('nutrition.protein')}</div>
                </div>
                <div>
                  <div className="text-xl font-bold">{Math.round(plan.totals.fat)}g</div>
                  <div className="text-muted-foreground">{t('nutrition.fat')}</div>
                </div>
                <div>
                  <div className="text-xl font-bold">{Math.round(plan.totals.carbs)}g</div>
                  <div className="text-muted-foreground">{t('nutrition.carbs')}</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface MealSectionProps {
  mealType: MealType;
  meals: MealItem[];
  date: string;
}

function MealSection({ mealType, meals, date }: MealSectionProps) {
  const { t } = useTranslation();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">
          {MEAL_EMOJIS[mealType]} {t(`categories.${mealType}`)}
        </h3>
        <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          {t('mealPlan.addMeal')}
        </Button>
      </div>

      {meals.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('mealPlan.noMeals')}</p>
      ) : (
        <div className="space-y-2">
          {meals.map((meal) => (
            <MealItemRow key={meal.id} meal={meal} date={date} />
          ))}
        </div>
      )}

      <AddMealDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        mealType={mealType}
        date={date}
      />
    </div>
  );
}

interface MealItemRowProps {
  meal: MealItem;
  date: string;
}

function MealItemRow({ meal, date }: MealItemRowProps) {
  const { t } = useTranslation();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const updateServings = useUpdateMealServings();
  const removeMeal = useRemoveMeal();

  const servings = meal.servings ?? 1;

  const changeServings = (delta: number) => {
    const next = Math.max(0.5, Math.round((servings + delta) * 2) / 2);
    updateServings.mutate(
      { mealId: meal.id, servings: next, date },
      { onError: () => toast.error(t('errors.updatingServings')) },
    );
  };

  const onDelete = async () => {
    try {
      await removeMeal.mutateAsync({ mealId: meal.id, date });
      toast.success(t('toast.mealDeleted'));
      setDeleteOpen(false);
    } catch {
      toast.error(t('errors.deletingMeal'));
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-md bg-muted/50 px-3 py-2">
      <span className="flex-1 text-sm font-medium">{meal.recipe_name}</span>

      {meal.calories_per_serving != null && (
        <span className="text-xs text-muted-foreground">
          {Math.round(meal.calories_per_serving * servings)} {t('nutrition.kcal')}
        </span>
      )}

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => changeServings(-0.5)}
          disabled={servings <= 0.5 || updateServings.isPending}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="min-w-[2.5rem] text-center text-sm">{servings}×</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => changeServings(0.5)}
          disabled={updateServings.isPending}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-muted-foreground hover:text-destructive"
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 className="h-3 w-3" />
      </Button>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('deleteModal.deleteMealConfirm')}</DialogTitle>
            <DialogDescription>
              <strong>{meal.recipe_name}</strong> {t('deleteModal.mealWillBeDeleted')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              {t('buttons.cancel')}
            </Button>
            <Button variant="destructive" onClick={onDelete} disabled={removeMeal.isPending}>
              {removeMeal.isPending ? t('deleteModal.deleting') : t('deleteModal.deleteMeal')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface AddMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealType: MealType;
  date: string;
}

function AddMealDialog({ open, onOpenChange, mealType, date }: AddMealDialogProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const addMeal = useAddMeal();
  const recipesQuery = useRecipes({ search: debouncedSearch || null, page: 1 });

  const handleClose = (v: boolean) => {
    onOpenChange(v);
    if (!v) setSearch('');
  };

  const onAdd = async (recipeId: number) => {
    try {
      await addMeal.mutateAsync({ date, meal_type: mealType, recipe_id: recipeId, servings: 1 });
      toast.success(t('toast.mealAdded'));
      handleClose(false);
    } catch {
      toast.error(t('errors.addingMeal'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {t('mealPlan.addMealTo')} – {MEAL_EMOJIS[mealType]} {t(`categories.${mealType}`)}
          </DialogTitle>
        </DialogHeader>

        <Input
          placeholder={t('recipes.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />

        <div className="mt-1 max-h-80 space-y-1 overflow-y-auto">
          {recipesQuery.isLoading && <LoadingSpinner />}
          {recipesQuery.data?.recipes.map((recipe) => (
            <button
              key={recipe.id}
              type="button"
              className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted disabled:opacity-50"
              onClick={() => onAdd(recipe.id)}
              disabled={addMeal.isPending}
            >
              <div className="font-medium">{recipe.name}</div>
              {recipe.calories_per_serving != null && (
                <div className="text-xs text-muted-foreground">
                  {recipe.calories_per_serving} {t('nutrition.kcal')} / {t('recipeDetail.nutritionPerServing').split('(')[0].trim()}
                </div>
              )}
            </button>
          ))}
          {!recipesQuery.isLoading && recipesQuery.data?.recipes.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {t('recipes.noRecipesFound')}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
