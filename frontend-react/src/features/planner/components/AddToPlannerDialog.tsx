import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { CalendarPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddMeal } from '@/features/planner/api/useAddMeal';
import { useAuth } from '@/features/auth/context/AuthContext';
import { MEAL_TYPES, type MealType } from '@/lib/api/schemas';
import { todayIso } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface AddToPlannerDialogProps {
  recipeId: number;
  recipeName: string;
  className?: string;
}

export function AddToPlannerDialog({ recipeId, recipeName, className }: AddToPlannerDialogProps) {
  const { t } = useTranslation();
  const { isAuthenticated, openLogin } = useAuth();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayIso);
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [servings, setServings] = useState(1);
  const addMeal = useAddMeal();

  const handleTriggerClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    setOpen(true);
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setDate(todayIso());
      setMealType('breakfast');
      setServings(1);
    }
  };

  const onSubmit = async () => {
    try {
      await addMeal.mutateAsync({
        date,
        meal_type: mealType,
        recipe_id: recipeId,
        servings: Math.max(0.5, servings),
      });
      toast.success(t('toast.mealAdded'));
      handleOpenChange(false);
    } catch {
      toast.error(t('errors.addingMeal'));
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleTriggerClick}
        aria-label={t('planner.addToPlanner')}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-full bg-card/80 text-muted-foreground backdrop-blur transition hover:text-primary',
          className,
        )}
      >
        <CalendarPlus className="h-5 w-5" />
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('planner.addToPlanner')}</DialogTitle>
            <DialogDescription>{recipeName}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="planner-date">{t('planner.date')}</Label>
              <Input
                id="planner-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('planner.mealType')}</Label>
              <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEAL_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`categories.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="planner-servings">{t('planner.servings')}</Label>
              <Input
                id="planner-servings"
                type="number"
                min={0.5}
                step={0.5}
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => handleOpenChange(false)}>
              {t('buttons.cancel')}
            </Button>
            <Button onClick={onSubmit} disabled={addMeal.isPending}>
              {addMeal.isPending ? t('app.loading') : t('planner.addToPlanner')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
