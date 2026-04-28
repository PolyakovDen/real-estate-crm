import './globals.css';
import '@mantine/core/styles.css';

import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';


import { Inter } from 'next/font/google';
import Script from 'next/script';
import NextTopLoader from 'nextjs-toploader';
import { MantineProvider, mantineHtmlProps } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { theme } from '@/lib/theme';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'RE CRM — Управління нерухомістю',
  description: 'Внутрішня CRM для агенції нерухомості. Об\'єкти, ціни, угоди.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: 'RE CRM — Управління нерухомістю',
    description: 'Внутрішня CRM для агенції нерухомості',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={inter.variable} {...mantineHtmlProps}>
      <head>
        <Script
          id="mantine-color-scheme"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{var _c=localStorage.getItem("mantine-color-scheme-value");var s=["light","dark","auto"].includes(_c)?_c:"auto";document.documentElement.setAttribute("data-mantine-color-scheme",s==="auto"?window.matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light":s)}catch(e){}`,
          }}
        />
      </head>
      <body>
        <NextTopLoader
          color="var(--mantine-primary-color-filled)"
          height={2}
          showSpinner={false}
          shadow="0 0 8px var(--mantine-primary-color-filled)"
        />
        <MantineProvider theme={theme} defaultColorScheme="auto">
          <QueryProvider>
            <ModalsProvider>
              <Notifications position="top-right" />
              {children}
            </ModalsProvider>
          </QueryProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
