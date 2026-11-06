import { getPublishedPost, getThread } from './content';
import { stripHtml } from './format';
import { SITE_URL } from './links';

const clip = (text, max = 160) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

const toDescription = (html) => clip(stripHtml(html)) || undefined;

// Metadatos de una lección o noticia. `path` es su única URL oficial.
export async function postMetadata(slug, path) {
    const post = await getPublishedPost(slug);
    if (!post) return {};

    const description = toDescription(post.content);
    return {
        title: post.title,
        description,
        alternates: { canonical: path },
        openGraph: {
            type: 'article',
            url: path,
            title: post.title,
            description,
            publishedTime: post.created_at,
            images: post.cover_image ? [post.cover_image] : undefined,
        },
    };
}

export async function threadMetadata(id) {
    const thread = await getThread(id);
    if (!thread) return {};

    const description = toDescription(thread.content);
    const path = `/foro/${thread.id}`;
    return {
        title: thread.title,
        description,
        alternates: { canonical: path },
        openGraph: { type: 'article', url: path, title: thread.title, description, publishedTime: thread.created_at },
    };
}

const PUBLISHER = { '@type': 'Organization', name: 'Turneoo', url: 'https://turneoo.com' };

export function articleJsonLd(post, path) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: toDescription(post.content),
        datePublished: post.created_at,
        image: post.cover_image || undefined,
        mainEntityOfPage: `${SITE_URL}${path}`,
        author: PUBLISHER,
        publisher: PUBLISHER,
    };
}

export function threadJsonLd(thread, authorName, replyCount) {
    return {
        '@context': 'https://schema.org',
        '@type': 'DiscussionForumPosting',
        headline: thread.title,
        text: toDescription(thread.content),
        datePublished: thread.created_at,
        url: `${SITE_URL}/foro/${thread.id}`,
        author: { '@type': 'Organization', name: authorName },
        commentCount: replyCount,
    };
}
