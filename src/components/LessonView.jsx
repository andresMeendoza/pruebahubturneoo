'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, MessageCircle } from 'react-feather';
import { hasVisibleContent, splitLessonVideo } from '../lib/academy';
import { moduleStyle } from '../lib/color';
import { sanitizeHtml } from '../lib/sanitize';
import { markLessonSeen, useSeenLessons } from '../lib/useSeenLessons';
import TrialCta from './TrialCta';

function LessonStage({ post, module, lessonNumber, videoSrc, hasBody }) {
    if (videoSrc) {
        return (
            <div className="overflow-hidden rounded-2xl bg-ink shadow-lift">
                <iframe
                    src={videoSrc}
                    title={`Video: ${post.title}`}
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="block aspect-video w-full border-0"
                />
            </div>
        );
    }

    if (post.cover_image) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.cover_image} alt="" className="aspect-[21/9] w-full rounded-2xl object-cover shadow-lift" />
        );
    }

    // Una lección solo de texto va directa al contenido.
    if (hasBody) return null;

    return (
        <div className="flex aspect-video items-center rounded-2xl bg-[var(--mod)] p-6 text-[var(--mod-on)] shadow-lift sm:p-12">
            <div>
                <p className="text-xs font-semibold sm:text-sm">Módulo {module.number} · Lección {lessonNumber}</p>
                <p className="mt-2 font-display text-2xl font-bold leading-tight sm:text-4xl">{post.title}</p>
                <span className="mt-4 inline-block rounded-full border border-current px-3 py-1 text-xs font-semibold sm:text-sm">
                    Próximamente
                </span>
            </div>
        </div>
    );
}

export default function LessonView({ post, module, nextModule }) {
    const seen = useSeenLessons();

    useEffect(() => {
        markLessonSeen(post.slug);
    }, [post.slug]);

    const lessons = module.lessons;
    const index = Math.max(0, lessons.findIndex((lesson) => lesson.slug === post.slug));
    const lessonNumber = index + 1;
    const prevLesson = lessons[index - 1];
    const nextLesson = lessons[index + 1];

    const { videoSrc, body } = splitLessonVideo(sanitizeHtml(post.content));
    const hasBody = hasVisibleContent(body);

    const nextTarget = nextLesson
        ? { href: `/ayuda/${nextLesson.slug}`, label: 'Siguiente lección' }
        : nextModule
            ? { href: `/ayuda/${nextModule.lessons[0].slug}`, label: 'Siguiente módulo' }
            : { href: '/', label: 'Ver todos los módulos' };

    return (
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-10" style={moduleStyle(module.color)}>
            <Link href="/" className="btn btn-secondary btn-sm !rounded-full">
                <ArrowLeft size={16} aria-hidden="true" /> Todos los módulos
            </Link>

            <header className="mb-5 mt-5 flex items-center gap-4">
                <span
                    aria-hidden="true"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--mod)] font-display text-xl font-bold text-[var(--mod-on)]"
                >
                    {module.number}
                </span>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--mod-text)]">Módulo {module.number}</p>
                    <p className="font-display text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-3xl">{module.name}</p>
                </div>
            </header>

            <LessonStage post={post} module={module} lessonNumber={lessonNumber} videoSrc={videoSrc} hasBody={hasBody} />

            <div className="mt-5">
                <p className="text-sm font-semibold text-[var(--mod-text)]">Lección {lessonNumber} de {lessons.length}</p>
                <h1 className="mt-0.5 text-2xl font-bold text-ink sm:text-3xl">{post.title}</h1>
            </div>

            <nav aria-label="Lecciones" className="mt-4 flex flex-col-reverse gap-3 sm:flex-row">
                {prevLesson ? (
                    <Link href={`/ayuda/${prevLesson.slug}`} className="btn btn-secondary flex-1 !rounded-full">
                        <ArrowLeft size={16} aria-hidden="true" /> Anterior
                    </Link>
                ) : (
                    <span aria-disabled="true" className="btn btn-secondary flex-1 cursor-not-allowed !rounded-full opacity-50">
                        <ArrowLeft size={16} aria-hidden="true" /> Anterior
                    </span>
                )}
                <Link href={nextTarget.href} className="btn flex-1 !rounded-full bg-[var(--mod)] text-[var(--mod-on)] hover:brightness-90">
                    {nextTarget.label} <ArrowRight size={16} aria-hidden="true" />
                </Link>
            </nav>

            {hasBody && (
                <div className="prose-content card mt-6 p-5 sm:p-8" dangerouslySetInnerHTML={{ __html: body }} />
            )}

            <Link href="/foro" className="card card-link mt-4 flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                    <MessageCircle size={20} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink">¿Tienes dudas con esta lección?</span>
                    <span className="block text-sm text-muted">Pregúntale a la comunidad de Turneoo.</span>
                </span>
                <ArrowRight size={16} aria-hidden="true" className="shrink-0 text-muted" />
            </Link>

            <section aria-labelledby="lecciones-modulo" className="mt-8">
                <h2 id="lecciones-modulo" className="mb-3 text-lg font-bold text-ink">Lecciones de este módulo</h2>
                <ol className="grid gap-2 md:grid-cols-2">
                    {lessons.map((lesson, i) => {
                        const isCurrent = lesson.slug === post.slug;
                        const isSeen = seen.has(lesson.slug);
                        return (
                            <li key={lesson.slug}>
                                <Link
                                    href={`/ayuda/${lesson.slug}`}
                                    aria-current={isCurrent ? 'page' : undefined}
                                    className={`flex h-full items-center gap-3 rounded-xl border bg-surface px-3 py-2.5 transition-colors ${isCurrent ? 'border-[var(--mod)] shadow-[inset_0_0_0_1px_var(--mod)]' : 'border-line hover:border-line-strong'}`}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${isCurrent ? 'bg-[var(--mod)] text-[var(--mod-on)]' : 'bg-canvas text-muted'}`}
                                    >
                                        {isSeen && !isCurrent ? <Check size={14} /> : i + 1}
                                    </span>
                                    <span className={`min-w-0 flex-1 text-[0.9375rem] ${isCurrent ? 'font-semibold text-ink' : 'text-ink-soft'}`}>{lesson.title}</span>
                                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${isCurrent ? 'bg-[var(--mod)] text-[var(--mod-on)]' : 'bg-canvas text-muted'}`}>
                                        {isCurrent ? 'Viendo' : isSeen ? 'Vista' : 'Ver'}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ol>
            </section>

            {nextModule && (
                <Link
                    href={`/ayuda/${nextModule.lessons[0].slug}`}
                    className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-ink px-5 py-4 text-white transition-colors hover:bg-ink-soft"
                >
                    <span className="min-w-0">
                        <span className="block text-xs font-semibold text-white/70">Siguiente módulo</span>
                        <span className="block font-display text-lg font-bold">{nextModule.number}. {nextModule.name}</span>
                    </span>
                    <ArrowRight size={20} aria-hidden="true" className="shrink-0" />
                </Link>
            )}

            <TrialCta className="mt-6" />
        </div>
    );
}
