import { z } from 'zod';

const publicEnvSchema = z.object({
  VITE_API_URL: z.string().trim().min(1).default('/api'),
  VITE_ENABLE_DEMO_AUTH: z.enum(['true', 'false']).optional(),
  VITE_CLERK_PUBLISHABLE_KEY: z.string().startsWith('pk_').optional(),
});

export interface PublicEnv {
  apiUrl: string;
  demoAuthEnabled: boolean;
  clerkPublishableKey?: string;
}

export function parsePublicEnv(
  input: Record<string, unknown>,
  options: { isProduction: boolean },
): PublicEnv {
  const result = publicEnvSchema.safeParse(input);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid public environment configuration: ${details}`);
  }

  const demoAuthEnabled = result.data.VITE_ENABLE_DEMO_AUTH
    ? result.data.VITE_ENABLE_DEMO_AUTH === 'true'
    : !options.isProduction;

  if (options.isProduction && demoAuthEnabled) {
    throw new Error('VITE_ENABLE_DEMO_AUTH cannot be true in a production build.');
  }

  return {
    apiUrl: result.data.VITE_API_URL,
    demoAuthEnabled,
    clerkPublishableKey: result.data.VITE_CLERK_PUBLISHABLE_KEY,
  };
}

export const env = parsePublicEnv(import.meta.env, {
  isProduction: import.meta.env.PROD,
});
