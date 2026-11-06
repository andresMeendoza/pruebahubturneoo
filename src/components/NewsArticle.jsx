import Link from 'next/link';
import { ArrowLeft } from 'react-feather';
import { formatDate } from '../lib/format';
import { sanitizeHtml } from '../lib/sanitize';

export default function NewsArticle({ post }) {
    return (
        <article className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-10">
            <Link href="/noticias" className="btn btn-ghost btn-sm -ml-2 mb-5">
                <ArrowLeft size={16} aria-hidden="true" /> Volver a Noticias
            </Link>

            <header className="mb-6">
                {post.category && <span className="tag tag-brand">{post.category}</span>}
                <h1 className="mt-3 text-4xl font-extrabold text-ink sm:text-5xl">{post.title}</h1>
                <p className="mt-3 text-muted">{formatDate(post.created_at)}</p>
            </header>

            {post.cover_image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.cover_image} alt="" className="mb-6 aspect-[16/9] w-full rounded-2xl object-cover" />
            )}

            <div
                className="prose-content card p-5 sm:p-8"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
            />
        </article>
    );
}
