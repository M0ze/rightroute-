// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

// Declare a global variable for PrismaClient in development to prevent
// multiple instances from being created during hot-reloading.
declare global {
  var prisma: PrismaClient | undefined;
}

// Ensure a single instance of PrismaClient across the application.
// This is a common practice to optimize database connections.
export const prisma =
  global.prisma ||
  new PrismaClient({
    // Optional: Log database queries for debugging in development.
    // For a production environment in Uganda with potential low bandwidth,
    // logging verbosity should be carefully managed to reduce overhead.
    log: process.env.NEXT_PUBLIC_NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// In development, store the PrismaClient instance globally to avoid re-instantiation
// with Next.js hot-reloading, which can lead to multiple database connections.
if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Export the Prisma client for use throughout the application.
// Example usage: await prisma.user.findMany();
