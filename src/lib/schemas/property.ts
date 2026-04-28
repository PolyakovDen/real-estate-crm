import { z } from 'zod';

export const propertyTypeEnum = z.enum([
  'apartment', 'house', 'commercial', 'land', 'garage', 'room',
]);

export const dealTypeEnum = z.enum([
  'sale', 'rent_long', 'rent_short', 'rent_daily',
]);

export const propertyStatusEnum = z.enum([
  'draft', 'active', 'reserved', 'sold', 'rented', 'archived', 'withdrawn',
]);

export const conditionEnum = z.enum([
  'new_building', 'after_repair', 'designer', 'lived', 'needs_repair', 'shell',
]);

export const listingTypeEnum = z.enum([
  'exclusive', 'non_exclusive', 'info',
]);

const optionalString = z.string().optional().or(z.literal(''));

export const propertyFormSchema = z.object({
  property_type: propertyTypeEnum,
  deal_type: dealTypeEnum,
  status: propertyStatusEnum.default('draft'),

  title: z.string().min(5, 'Мінімум 5 символів').max(200),
  description: optionalString,

  city: z.string().min(2, 'Вкажіть місто'),
  district: optionalString,
  street: optionalString,
  building_number: optionalString,

  total_area: z.number().positive().optional().or(z.literal(undefined)),
  living_area: z.number().positive().optional().or(z.literal(undefined)),
  rooms: z.number().int().min(0).max(20).optional().or(z.literal(undefined)),
  floor: z.number().int().optional().or(z.literal(undefined)),
  total_floors: z.number().int().min(1).optional().or(z.literal(undefined)),

  bedrooms: z.number().int().min(0).max(20).optional().or(z.literal(undefined)),

  price: z.number().positive('Ціна має бути більше 0'),
  currency: z.enum(['USD', 'EUR', 'UAH']).default('USD'),
  commission_percent: z.number().min(0).max(100).optional().or(z.literal(undefined)),

  condition: conditionEnum.optional(),
  listing_type: listingTypeEnum.default('non_exclusive'),
  year_built: z.number().int().min(1800).max(new Date().getFullYear() + 5).optional().or(z.literal(undefined)),
  exclusive_until: optionalString,

  owner_name: optionalString,
  owner_phone: optionalString,
  owner_notes: optionalString,
});

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;
