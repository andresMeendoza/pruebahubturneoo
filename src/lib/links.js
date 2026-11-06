export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.turneoo.com';
export const SIGNUP_URL = `${APP_URL}/signup`;
export const WEBSITE_URL = 'https://turneoo.com';

// Obligatoria en producción: sin ella, el sitemap y las URL canónicas apuntarían a localhost.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
