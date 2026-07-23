export function requireSyntheticEnvironment() {
  if (process.env.ENABLE_SYNTHETIC_API !== 'true' || process.env.VERCEL_ENV === 'production') {
    throw new Error('The synthetic Stage 2 API is disabled.');
  }
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is required.');
  return databaseUrl;
}
