import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AddRecipeForm } from './AddRecipeForm';
import { useEditRecipe } from '@/features/recipes/api/useEditRecipe';
import type { RecipeDetail } from '@/lib/api/schemas';

interface EditRecipeDialogProps {
  recipe: RecipeDetail;
  trigger: ReactNode;
}

export function EditRecipeDialog({ recipe, trigger }: EditRecipeDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const edit = useEditRecipe();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('addRecipeForm.editTitle')}</DialogTitle>
          <DialogDescription>{recipe.name}</DialogDescription>
        </DialogHeader>
        <AddRecipeForm
          initialValues={recipe}
          onSave={async (values) => {
            await edit.mutateAsync({ id: recipe.id, data: values });
            toast.success(t('toast.recipeUpdated'));
            setOpen(false);
          }}
          isSaving={edit.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
