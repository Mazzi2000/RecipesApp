import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteRecipe } from '@/features/recipes/api/useDeleteRecipe';

interface Props {
  recipeId: number;
  recipeName: string;
}

export function DeleteRecipeButton({ recipeId, recipeName }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const remove = useDeleteRecipe();

  const onConfirm = async () => {
    try {
      await remove.mutateAsync(recipeId);
      toast.success(t('toast.recipeDeleted'));
      setOpen(false);
      navigate('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.deletingRecipe'));
    }
  };

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" />
        {t('recipes.delete')}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('deleteModal.deleteRecipeConfirm')}</DialogTitle>
            <DialogDescription>
              <strong>{recipeName}</strong> {t('deleteModal.recipeWillBeDeleted')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t('buttons.cancel')}
            </Button>
            <Button variant="destructive" onClick={onConfirm} disabled={remove.isPending}>
              {remove.isPending ? t('deleteModal.deleting') : t('recipes.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
