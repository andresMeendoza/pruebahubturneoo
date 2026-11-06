import { SITE_URL } from '../lib/links';

export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/foro/nuevo', '/foro/editar/'],
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
