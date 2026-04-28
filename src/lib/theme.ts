import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'teal',
  fontFamily: 'var(--font-inter), Inter, -apple-system, sans-serif',
  defaultRadius: 'sm',
  cursorType: 'pointer',
  headings: {
    fontFamily: 'var(--font-inter), Inter, -apple-system, sans-serif',
    fontWeight: '600',
    sizes: {
      h1: { fontSize: '1.5rem', lineHeight: '1.25' },
      h2: { fontSize: '1.25rem', lineHeight: '1.3' },
      h3: { fontSize: '1.0625rem', lineHeight: '1.35' },
      h4: { fontSize: '0.9375rem', lineHeight: '1.4' },
    },
  },
  components: {
    Button: {
      defaultProps: { size: 'sm' },
    },
    Paper: {
      defaultProps: { radius: 'sm' },
    },
    Card: {
      defaultProps: { radius: 'sm' },
    },
    Badge: {
      defaultProps: { variant: 'light', radius: 'sm' },
    },
    NavLink: {
      defaultProps: { variant: 'light' },
    },
  },
});
