export const runtime = 'edge';
import { notFound } from 'next/navigation';
import { getThread } from '../../../lib/content';
import { threadJsonLd, threadMetadata } from '../../../lib/seo';
import { supabase } from '../../../lib/supabase';
import JsonLd from '../../../components/JsonLd';
import ThreadClient from './ThreadClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
    const { id } = await params;
    return threadMetadata(id);
}

export default async function ThreadPage({ params }) {
    const { id } = await params;
    const thread = await getThread(id);

    if (!thread) notFound();

    const { data: replies } = await supabase
        .from('forum_replies')
        .select('*')
        .eq('thread_id', id)
        .order('created_at', { ascending: true });

    const authorIds = [...new Set([thread.author_id, ...(replies || []).map((r) => r.author_id)])];
    // Del más nuevo al más antiguo: si un autor tiene varios negocios, queda el más antiguo.
    const { data: organizations } = await supabase
        .from('organizations')
        .select('owner_id, name')
        .in('owner_id', authorIds)
        .order('created_at', { ascending: false });

    const authors = {};
    (organizations || []).forEach((org) => { authors[org.owner_id] = org.name; });

    return (
        <>
            <JsonLd data={threadJsonLd(thread, authors[thread.author_id] || 'Usuario de Turneoo', replies?.length || 0)} />
            <ThreadClient thread={thread} initialReplies={replies || []} initialAuthors={authors} />
        </>
    );
}
