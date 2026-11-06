import { cache } from 'react';
import { supabase } from './supabase';

// Lecturas del servidor. `cache` evita repetir la consulta entre los metadatos y la página.
export const getPublishedPost = cache(async (slug) => {
    const { data } = await supabase
        .from('hub_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
    return data;
});

export const getThread = cache(async (id) => {
    const { data } = await supabase.from('forum_threads').select('*').eq('id', id).maybeSingle();
    return data;
});

export async function getAcademyData() {
    const [lessons, categories, colors] = await Promise.all([
        supabase
            .from('hub_posts')
            .select('title, slug, created_at, category, is_pinned')
            .eq('status', 'published')
            .eq('type', 'help'),
        supabase.from('hub_categories').select('*'),
        supabase.from('hub_colors').select('*'),
    ]);
    return { lessons: lessons.data || [], categories: categories.data || [], colors: colors.data || [] };
}
