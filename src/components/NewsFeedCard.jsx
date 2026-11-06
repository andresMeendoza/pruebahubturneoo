import Link from 'next/link';
import { ArrowRight } from 'react-feather';
import { formatDate } from '../lib/format';
import { PinnedTag } from './PostCard';

export default function NewsFeedCard({ post, href, themeColor, excerpt }) {
    return (
        <Link href={href} className="card card-link group block overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 pt-5">
                <div className="flex min-w-0 items-center gap-3">
                    <span
                        aria-hidden="true"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold text-white"
                        style={{ backgroundColor: themeColor }}
                    >
                        {post.category ? post.category.charAt(0).toUpperCase() : 'N'}
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-[0.9375rem] font-semibold text-ink">{post.category || 'Novedades'}</p>
                        <p className="text-[0.8125rem] text-muted">{formatDate(post.created_at)}</p>
                    </div>
                </div>
                {post.is_pinned && <PinnedTag className="shrink-0" />}
            </div>

            <div className="px-5 py-4">
                <h2 className="text-2xl font-bold text-ink group-hover:text-brand-hover">{post.title}</h2>
                {excerpt && <p className="mt-2 line-clamp-4 text-muted">{excerpt}</p>}
            </div>

            {post.cover_image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.cover_image} alt="" className="aspect-[16/9] w-full object-cover" />
            )}

            <p className="flex items-center gap-1.5 border-t border-line px-5 py-3 text-[0.9375rem] font-semibold text-brand">
                Leer comunicado completo <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
            </p>
        </Link>
    );
}
