import { useTranslation } from 'react-i18next';
import { useRecipeTags } from '@/features/recipes/api/useRecipeTags';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TagFilterProps {
  value: string;
  onChange: (value: string | null) => void;
}

const ALL = '__all__';

export function TagFilter({ value, onChange }: TagFilterProps) {
  const { t } = useTranslation();
  const { data: tags = [] } = useRecipeTags();

  if (tags.length === 0) return null;

  return (
    <Select value={value || ALL} onValueChange={(v) => onChange(v === ALL ? null : v)}>
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{t('categories.all')}</SelectItem>
        {tags.map((tag) => (
          <SelectItem key={tag} value={tag}>
            {tag}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
