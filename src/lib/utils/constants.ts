export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Квартира',
  house: 'Будинок',
  commercial: 'Комерція',
  land: 'Земля',
  garage: 'Гараж',
  room: 'Кімната',
};

export const DEAL_TYPE_LABELS: Record<string, string> = {
  sale: 'Продаж',
  rent_long: 'Довгострокова оренда',
  rent_short: 'Короткострокова оренда',
  rent_daily: 'Подобово',
};

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Чернетка',
  active: 'В роботі',
  reserved: 'В резерві',
  sold: 'Продано',
  rented: 'Здано',
  archived: 'Архів',
  withdrawn: 'Знято з продажу',
};

export const STATUS_COLORS: Record<string, string> = {
  draft: 'gray',
  active: 'teal',
  reserved: 'yellow',
  sold: 'green',
  rented: 'green',
  archived: 'gray',
  withdrawn: 'red',
};

export const STATUS_DOT_COLORS: Record<string, string> = {
  draft: 'var(--mantine-color-gray-4)',
  active: 'var(--mantine-color-teal-6)',
  reserved: 'var(--mantine-color-yellow-5)',
  sold: 'var(--mantine-color-green-6)',
  rented: 'var(--mantine-color-green-6)',
  archived: 'var(--mantine-color-gray-4)',
  withdrawn: 'var(--mantine-color-red-5)',
};

export const ROLE_LABELS: Record<string, string> = {
  agent: 'Агент',
  manager: 'Менеджер',
  admin: 'Адмін',
};

export const CONDITION_LABELS: Record<string, string> = {
  new_building: 'Новобудова',
  after_repair: 'Після ремонту',
  designer: 'Дизайнерський',
  lived: 'Жилий стан',
  needs_repair: 'Потребує ремонту',
  shell: 'Від забудовника',
};

export const LISTING_TYPE_LABELS: Record<string, string> = {
  exclusive: 'Ексклюзив',
  non_exclusive: 'Не ексклюзив',
  info: 'Інформаційний',
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  UAH: '₴',
};
