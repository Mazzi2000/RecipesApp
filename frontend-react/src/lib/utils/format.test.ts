
import { describe, it, expect } from 'vitest';
import { formatNumber, toIsoDate, shiftDate } from './format';

describe('formatNumber', () => {
  it('shows an em dash for null / undefined / NaN', () => {
    expect(formatNumber(null)).toBe('—');
    expect(formatNumber(undefined)).toBe('—');
    expect(formatNumber(NaN)).toBe('—');
  });

  it('rounds to the requested number of digits', () => {
    expect(formatNumber(42)).toBe('42');
    expect(formatNumber(42.6)).toBe('43');
    expect(formatNumber(42.567, 1)).toBe('42.6');
  });
});

describe('shiftDate', () => {
  it('moves a date forward and backward by whole days', () => {
    expect(shiftDate('2024-01-01', 1)).toBe('2024-01-02');
    expect(shiftDate('2024-01-01', -1)).toBe('2023-12-31'); // crosses year
  });
});

describe('toIsoDate', () => {
  it('formats a Date as YYYY-MM-DD with zero padding', () => {
    expect(toIsoDate(new Date(2024, 0, 5))).toBe('2024-01-05');
  });
});