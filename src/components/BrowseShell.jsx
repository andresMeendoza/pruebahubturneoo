'use client';

import CategoryNav from './CategoryNav';
import SearchField from './SearchField';

// Estructura común de las páginas que listan contenido (Inicio y Noticias).
export default function BrowseShell({
    eyebrow,
    title,
    description,
    heroExtras,
    search,
    categories,
    selectedCategory,
    onSelectCategory,
    children,
}) {
    return (
        <>
            <section className="hero-surface border-b border-line">
                <div className="page-shell py-10 sm:py-14">
                    <div className="max-w-2xl">
                        <p className="eyebrow mb-2">{eyebrow}</p>
                        <h1 className="text-4xl font-extrabold text-ink sm:text-5xl">{title}</h1>
                        <p className="mt-3 text-lg text-muted">{description}</p>
                        <div className="mt-6">
                            <SearchField {...search} />
                        </div>
                        {heroExtras}
                    </div>
                </div>
            </section>

            <div className="page-shell py-6 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 lg:py-10">
                <aside className="mb-6 self-start lg:sticky lg:top-[calc(var(--nav-offset)+0.5rem)] lg:mb-0">
                    <CategoryNav
                        categories={categories}
                        selected={selectedCategory}
                        onSelect={onSelectCategory}
                    />
                </aside>
                <div className="min-w-0">{children}</div>
            </div>
        </>
    );
}
