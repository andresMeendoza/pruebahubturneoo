export const runtime = 'edge';
import { notFound, permanentRedirect } from 'next/navigation';
import { getPublishedPost } from '../../../lib/content';
import { articleJsonLd, postMetadata } from '../../../lib/seo';
import JsonLd from '../../../components/JsonLd';
import NewsArticle from '../../../components/NewsArticle';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
    const { slug } = await params;
    return postMetadata(slug, `/noticias/${slug}`);
}

export default async function NewsPage({ params }) {
    const { slug } = await params;
    const post = await getPublishedPost(slug);

    if (!post) notFound();

    // Cada contenido tiene una sola URL: los tutoriales viven en /ayuda.
    if (post.type === 'help') permanentRedirect(`/ayuda/${slug}`);

    return (
        <>
            <JsonLd data={articleJsonLd(post, `/noticias/${slug}`)} />
            <NewsArticle post={post} />
        </>
    );
}
