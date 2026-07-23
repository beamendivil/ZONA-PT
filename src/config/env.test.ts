import { describe, expect, it } from 'vitest';
import { parsePublicEnv } from './env';

describe('parsePublicEnv', () => {
  it('uses safe defaults in development', () => {
    expect(parsePublicEnv({}, { isProduction: false })).toEqual({
      apiUrl: '/api',
      demoAuthEnabled: true,
      clerkPublishableKey: undefined,
    });
  });

  it('disables demo authentication by default in production', () => {
    expect(parsePublicEnv({}, { isProduction: true }).demoAuthEnabled).toBe(false);
  });

  it('rejects demo authentication in production', () => {
    expect(() =>
      parsePublicEnv({ VITE_ENABLE_DEMO_AUTH: 'true' }, { isProduction: true }),
    ).toThrow('cannot be true in a production build');
  });

  it('rejects invalid boolean values instead of guessing', () => {
    expect(() =>
      parsePublicEnv({ VITE_ENABLE_DEMO_AUTH: 'yes' }, { isProduction: false }),
    ).toThrow('Invalid public environment configuration');
  });
});
