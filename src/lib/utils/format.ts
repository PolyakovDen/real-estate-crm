import { CURRENCY_SYMBOLS } from './constants';

export function formatPrice(price: number, currency: string = 'USD'): string {
  const formatted = new Intl.NumberFormat('uk-UA').format(price);
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  return `${formatted} ${symbol}`;
}

export function formatArea(area: number | null | undefined): string {
  if (!area) return '—';
  return `${area} м²`;
}

export function formatFloor(floor: number | null | undefined, totalFloors: number | null | undefined): string {
  if (!floor) return '—';
  if (totalFloors) return `${floor} з ${totalFloors}`;
  return `${floor}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
