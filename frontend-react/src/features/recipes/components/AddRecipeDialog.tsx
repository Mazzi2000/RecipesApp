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
import { useCreateRecipe } from '@/features/recipes/api/useCreateRecipe';

interface AddRecipeDialogProps {
  trigger: ReactNode;
}

export function AddRecipeDialog({ trigger }: AddRecipeDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const create = useCreateRecipe();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('addRecipeForm.title', { defaultValue: 'Add recipe' })}</DialogTitle>
          <DialogDescription>
            {t('addRecipeForm.description', {
              defaultValue: 'Fill out the details to add a new recipe.',
            })}
          </DialogDescription>
        </DialogHeader>
        <AddRecipeForm
          onSave={async (values) => {
            await create.mutateAsync(values);
            toast.success(t('toast.recipeAdded'));
          }}
          isSaving={create.isPending}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
