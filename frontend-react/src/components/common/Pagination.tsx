import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 py-6">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label={t('common.previous', { defaultValue: 'Previous' })}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground">
        {t('common.pageOf', {
          defaultValue: 'Page {{page}} of {{totalPages}}',
          page,
          totalPages,
        })}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label={t('common.next', { defaultValue: 'Next' })}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
