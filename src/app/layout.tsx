// src/app/layout.tsx
import './global.css'; // Global styles (TailwindCSS)
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthProvider';
import { ThemeProvider } from '@/context/ThemeProvider'; // For dark/light mode
import { Toaster } from 'sonner'; // For toasts/notifications
import { LanguageProvider } from '@/context/LanguageProvider'; // For i18n
// import { TRPCReactProvider } from '@/trpc/react'; // Placeholder for tRPC if we add it later

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RightRoute - Transport & Delivery in Uganda',
  description: 'Your reliable partner for logistics and delivery in Mubende District and beyond.',
  manifest: '/manifest.json', // PWA manifest
  themeColor: '#ffffff', // For PWA
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <LanguageProvider>
              {/* <TRPCReactProvider> */}{/* Uncomment if tRPC is integrated */}
                {children}
                <Toaster richColors /> {/* Toast notifications */}
              {/* </TRPCReactProvider> */}
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
