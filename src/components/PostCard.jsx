import Link from 'next/link';
import { BookOpen, Bookmark } from 'react-feather';
import { formatDate } from '../lib/format';

export function PinnedTag({ className = '' }) {
    return (
        <span className={`tag tag-pin ${className}`}>
            <Bookmark size={12} aria-hidden="true" /> Destacado
        </span>
    );
}

export function PostCover({ post, themeColor }) {
    return (
        <div className="relative aspect-[16/9] overflow-hidden" style={{ backgroundColor: themeColor }}>
            {post.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={post.cover_image}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
            ) : (
                <div className="flex h-full items-center justify-center text-white/70">
                    <BookOpen size={36} strokeWidth={1.5} aria-hidden="true" />
                </div>
            )}
            {post.is_pinned && <PinnedTag className="absolute right-3 top-3" />}
        </div>
    );
}

export default function PostCard({ post, href, kicker, excerpt, themeColor = 'var(--color-brand)' }) {
    return (
        <Link href={href} className="card card-link group flex flex-col overflow-hidden">
            <PostCover post={post} themeColor={themeColor} />
            <div className="flex flex-1 flex-col p-5">
                <p className="mb-2 flex flex-wrap items-center gap-x-2 text-[0.8125rem] font-semibold text-muted">
                    <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ backgroundColor: themeColor }} />
                    {kicker}
                    {post.category && <span className="font-medium">· {post.category}</span>}
                </p>
                <h2 className="text-xl font-bold text-ink group-hover:text-brand-hover">{post.title}</h2>
                {excerpt && <p className="mt-2 line-clamp-3 text-[0.9375rem] text-muted">{excerpt}</p>}
                <p className="mt-auto pt-4 text-[0.8125rem] text-muted">{formatDate(post.created_at)}</p>
            </div>
        </Link>
    );
}
