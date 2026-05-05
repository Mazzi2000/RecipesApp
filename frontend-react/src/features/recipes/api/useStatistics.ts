import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { qk } from '@/lib/query/keys';
import { StatisticsSchema } from '@/lib/api/schemas';

export function useStatistics() {
  return useQuery<number>({
    queryKey: qk.statistics,
    queryFn: () => api('/statistics', {}, StatisticsSchema),
  });
}
