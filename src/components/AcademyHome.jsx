'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Search } from 'react-feather';
import { legibleOnWhite, moduleStyle } from '../lib/color';
import { useSeenLessons } from '../lib/useSeenLessons';
import EmptyState from './EmptyState';
import { PinnedTag } from './PostCard';
import SearchField from './SearchField';
import TrialCta from './TrialCta';

function ProgressBar({ value, max, label, className = '' }) {
    const percent = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-valuenow={value}
            className={`h-1.5 overflow-hidden rounded-full bg-line ${className}`}
        >
            <div className="h-full rounded-full bg-[var(--mod,var(--color-brand))] transition-[width] duration-300" style={{ width: `${percent}%` }} />
        </div>
    );
}

function ModuleCard({ module, seen }) {
    const total = module.lessons.length;
    const seenCount = module.lessons.filter((lesson) => seen.has(lesson.slug)).length;
    const nextLesson = module.lessons.find((lesson) => !seen.has(lesson.slug)) || module.lessons[0];

    const content = (
        <>
            <p className="text-xs font-semibold text-[var(--mod-text)]">Módulo</p>
            <p aria-hidden="true" className="font-display text-4xl font-extrabold leading-tight text-[var(--mod-text)]">{module.number}</p>
            <h2 className="mt-1 text-xl font-bold text-ink">
                <span className="sr-only">Módulo {module.number}: </span>{module.name}
            </h2>
            <p className="mt-1 text-sm text-muted">
                {total === 0
                    ? 'Próximamente'
                    : `${total} ${total === 1 ? 'lección' : 'lecciones'} · ${seenCount} ${seenCount === 1 ? 'vista' : 'vistas'}`}
            </p>
            <div className="mt-auto pt-4">
                <ProgressBar value={seenCount} max={total} label={`Progreso de ${module.name}`} />
                {total > 0 && (
                    <p className="mt-3 flex items-center gap-1.5 text-[0.9375rem] font-semibold text-[var(--mod-text)]">
                        {seenCount === 0 ? 'Ver módulo' : seenCount === total ? 'Repasar módulo' : 'Continuar'}
                        <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
                    </p>
                )}
            </div>
        </>
    );

    if (total === 0) {
        return <div className="card flex flex-col p-5 opacity-75" style={moduleStyle(module.color)}>{content}</div>;
    }

    return (
        <Link href={`/ayuda/${nextLesson.slug}`} className="card card-link group flex flex-col p-5" style={moduleStyle(module.color)}>
            {content}
        </Link>
    );
}

function LessonRow({ lesson, module, seen }) {
    return (
        <li className="border-b border-line last:border-b-0">
            <Link href={`/ayuda/${lesson.slug}`} className="group flex items-center gap-3 p-4 transition-colors hover:bg-canvas">
                <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: module.color }} />
                <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink group-hover:text-brand-hover">{lesson.title}</span>
                    <span className="block text-sm text-muted">
                        Módulo {module.number} · {module.name}{seen.has(lesson.slug) ? ' · Vista' : ''}
                    </span>
                </span>
                {lesson.is_pinned && <PinnedTag className="shrink-0" />}
                <ArrowRight size={16} aria-hidden="true" className="shrink-0 text-muted" />
            </Link>
        </li>
    );
}

export default function AcademyHome({ modules, accentColor, searchTerm, onSearchChange }) {
    const seen = useSeenLessons();

    // Filtramos para dejar únicamente los módulos que tienen al menos 1 lección
    const modulosActivos = modules.filter((module) => module.lessons && module.lessons.length > 0);

    const entries = modulosActivos.flatMap((module) => module.lessons.map((lesson) => ({ lesson, module })));
    const totalLessons = entries.length;
    const seenLessons = entries.filter(({ lesson }) => seen.has(lesson.slug)).length;
    const pinned = entries.filter(({ lesson }) => lesson.is_pinned);

    const query = searchTerm.trim().toLowerCase();
    const results = query
        ? entries.filter(({ lesson, module }) =>
            lesson.title.toLowerCase().includes(query) || module.name.toLowerCase().includes(query))
        : [];

    return (
        <div className="page-shell py-8 sm:py-12">
            <header className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-end lg:gap-12">
                <div>
                    <p className="mb-3 flex items-center gap-3 text-sm font-semibold" style={{ color: legibleOnWhite(accentColor) }}>
                        <span aria-hidden="true" className="h-0.5 w-7 rounded-full" style={{ backgroundColor: accentColor }} />
                        Academia Turneoo
                    </p>
                    <h1 className="text-4xl font-extrabold text-ink sm:text-5xl">
                        Aprende a sacarle todo el provecho a{' '}
                        <span style={{ color: legibleOnWhite(accentColor) }}>Turneoo</span>
                    </h1>
                </div>
                <div>
                    <p className="text-lg text-muted">Tutoriales paso a paso para organizar tu negocio y dominar la plataforma.</p>
                    {totalLessons > 0 && (
                        <ul className="mt-3 flex flex-wrap gap-2 text-sm text-muted">
                            <li className="rounded-full border border-line bg-surface px-3 py-1"><strong className="text-ink">{modulosActivos.length}</strong> {modulosActivos.length === 1 ? 'módulo' : 'módulos'}</li>
                            <li className="rounded-full border border-line bg-surface px-3 py-1"><strong className="text-ink">{totalLessons}</strong> {totalLessons === 1 ? 'lección' : 'lecciones'}</li>
                        </ul>
                    )}
                </div>
            </header>

            <div className="mt-7 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-8" style={moduleStyle(accentColor)}>
                <div className="max-w-xl">
                    <SearchField
                        label="Buscar una lección"
                        placeholder="Buscar un tema o una lección..."
                        value={searchTerm}
                        onChange={onSearchChange}
                    />
                </div>
                {totalLessons > 0 && (
                    <div className="flex items-center gap-3 text-sm text-muted">
                        <span>Tu progreso</span>
                        <strong className="text-ink">{seenLessons}/{totalLessons}</strong>
                        <ProgressBar value={seenLessons} max={totalLessons} label="Tu progreso total" className="w-32" />
                    </div>
                )}
            </div>

            <div className="mt-8">
                {query ? (
                    results.length > 0 ? (
                        <>
                            <p aria-live="polite" className="mb-3 text-sm text-muted">
                                {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
                            </p>
                            <ul className="card overflow-hidden">
                                {results.map(({ lesson, module }) => (
                                    <LessonRow key={lesson.slug} lesson={lesson} module={module} seen={seen} />
                                ))}
                            </ul>
                        </>
                    ) : (
                        <EmptyState
                            icon={Search}
                            title="No encontramos lecciones con esa búsqueda"
                            text="Prueba con otras palabras o revisa los módulos."
                            action={<button type="button" onClick={() => onSearchChange('')} className="btn btn-secondary btn-sm">Ver todos los módulos</button>}
                        />
                    )
                ) : modulosActivos.length === 0 ? (
                    <EmptyState
                        icon={BookOpen}
                        title="Aún no hay lecciones publicadas"
                        text="Mientras tanto, puedes preguntar a otros negocios en la comunidad."
                        action={<Link href="/foro" className="btn btn-secondary btn-sm">Ir a la comunidad</Link>}
                    />
                ) : (
                    <>
                        {pinned.length > 0 && (
                            <section aria-labelledby="destacados" className="mb-8">
                                <h2 id="destacados" className="mb-3 text-xl font-bold text-ink">Destacados</h2>
                                <ul className="card overflow-hidden">
                                    {pinned.map(({ lesson, module }) => (
                                        <LessonRow key={lesson.slug} lesson={lesson} module={module} seen={seen} />
                                    ))}
                                </ul>
                            </section>
                        )}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {modulosActivos.map((module) => (
                                <ModuleCard key={module.name} module={module} seen={seen} />
                            ))}
                        </div>
                    </>
                )}
            </div>

            <TrialCta className="mt-8" />
        </div>
    );
}