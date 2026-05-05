import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useFavoriteIds } from '@/features/favorites/api/useFavoriteIds';
import { useToggleFavorite } from '@/features/favorites/api/useToggleFavorite';
import { useAuth } from '@/features/auth/context/AuthContext';
import { cn } from '@/lib/utils/cn';

interface FavoriteButtonProps {
  recipeId: number;
  className?: string;
}

export function FavoriteButton({ recipeId, className }: FavoriteButtonProps) {
  const { t } = useTranslation();
  const { isAuthenticated, openLogin } = useAuth();
  const { data: ids = [] } = useFavoriteIds();
  const toggle = useToggleFavorite();

  const isFavorite = ids.includes(recipeId);

  const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Don't bubble up to the card link – matches the legacy "heart click does not navigate" UX.
    event.preventDefault();
    event.stopPropagation();
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    toggle.mutate(
      { recipeId, isFavorite },
      {
        onSuccess: () =>
          toast.success(isFavorite ? t('toast.favoriteRemoved') : t('toast.favoriteAdded')),
        onError: () =>
          toast.error(isFavorite ? t('errors.removingFavorite') : t('errors.addingFavorite')),
      },
    );
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? t('favorites.remove') : t('favorites.add')}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full bg-card/80 text-muted-foreground backdrop-blur transition hover:text-destructive',
        isFavorite && 'text-destructive',
        className,
      )}
    >
      <Heart className={cn('h-5 w-5', isFavorite && 'fill-current')} />
    </button>
  );
}
