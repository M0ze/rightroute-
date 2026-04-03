// src/context/ThemeProvider.tsx
'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

// Wrapper for next-themes ThemeProvider
// Provides dark/light mode functionality throughout the application.
// This is important for user preference and potentially for battery saving on mobile devices.
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
