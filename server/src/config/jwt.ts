export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'your-secret-key',
  REFRESH_SECRET: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key',
  ACCESS_TOKEN_EXPIRES_IN: '1h',
  REFRESH_TOKEN_EXPIRES_IN: '7d'
}; 