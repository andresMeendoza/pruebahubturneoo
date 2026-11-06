import { supabase } from '../../lib/supabase';
import NewsClient from '../../components/NewsClient';

export const revalidate = 60;

export default async function NoticiasPage() {
    const [posts, categories, colors] = await Promise.all([
        supabase
            .from('hub_posts')
            .select('title, slug, type, created_at, cover_image, category, is_pinned, excerpt')
            .eq('status', 'published')
            .eq('type', 'blog')
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false }),
        supabase.from('hub_categories').select('name').order('name'),
        supabase.from('hub_colors').select('*'),
    ]);

    return (
        <NewsClient
            posts={posts.data || []}
            categorias={['Todas', ...(categories.data || []).map((c) => c.name)]}
            systemColors={colors.data || []}
        />
    );
}
