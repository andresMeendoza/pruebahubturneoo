export const runtime = 'edge';
import { notFound, permanentRedirect } from 'next/navigation';
import { buildModules, DEFAULT_MODULE } from '../../../lib/academy';
import { getAcademyData, getPublishedPost } from '../../../lib/content';
import { articleJsonLd, postMetadata } from '../../../lib/seo';
import JsonLd from '../../../components/JsonLd';
import LessonView from '../../../components/LessonView';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
    const { slug } = await params;
    return postMetadata(slug, `/ayuda/${slug}`);
}

export default async function LessonPage({ params }) {
    const { slug } = await params;
    const post = await getPublishedPost(slug);

    if (!post) notFound();

    // Cada contenido tiene una sola URL: las noticias viven en /noticias.
    if (post.type !== 'help') permanentRedirect(`/noticias/${slug}`);

    const { lessons, categories, colors } = await getAcademyData();
    const modules = buildModules(categories, lessons, colors);
    const moduleName = post.category || DEFAULT_MODULE;
    const position = modules.findIndex((m) => m.name === moduleName);
    const nextModule = modules.slice(position + 1).find((m) => m.lessons.length > 0) || null;

    return (
        <>
            <JsonLd data={articleJsonLd(post, `/ayuda/${slug}`)} />
            <LessonView post={post} module={modules[position]} nextModule={nextModule} />
        </>
    );
}
