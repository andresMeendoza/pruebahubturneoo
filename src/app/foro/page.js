import { supabase } from '../../lib/supabase';
import ForumClient from '../../components/ForumClient';

// El foro debe mostrar de inmediato un tema recién creado o eliminado.
export const dynamic = 'force-dynamic';

export default async function ForumPage() {
    const { data } = await supabase
        .from('forum_threads')
        .select('id, title, category, created_at')
        .order('created_at', { ascending: false });

    return <ForumClient threads={data || []} />;
}
