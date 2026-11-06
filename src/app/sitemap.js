import { SITE_URL } from '../lib/links';
import { supabase } from '../lib/supabase';

export const revalidate = 3600;

export default async function sitemap() {
    const [posts, threads] = await Promise.all([
        supabase.from('hub_posts').select('slug, type, created_at').eq('status', 'published'),
        supabase.from('forum_threads').select('id, created_at'),
    ]);

    return [
        { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
        { url: `${SITE_URL}/noticias`, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${SITE_URL}/foro`, changeFrequency: 'daily', priority: 0.8 },
        ...(posts.data || []).map((post) => ({
            url: `${SITE_URL}/${post.type === 'help' ? 'ayuda' : 'noticias'}/${post.slug}`,
            lastModified: post.created_at,
            priority: 0.7,
        })),
        ...(threads.data || []).map((thread) => ({
            url: `${SITE_URL}/foro/${thread.id}`,
            lastModified: thread.created_at,
            priority: 0.5,
        })),
    ];
}
