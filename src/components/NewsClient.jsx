'use client';

import { useState } from 'react';
import { Bell, Grid, List, Search } from 'react-feather';
import BrowseShell from './BrowseShell';
import EmptyState from './EmptyState';
import NewsFeedCard from './NewsFeedCard';
import PostCard from './PostCard';

export default function NewsClient({ posts, categorias, systemColors }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [viewMode, setViewMode] = useState('grid');

    // 1. NUEVA LÍNEA: Creamos un Set (colección única) con las categorías que realmente tienen artículos publicados
    const categoriasUsadas = new Set(posts.map(post => post.category).filter(Boolean));

    // 2. NUEVA LÍNEA: Filtramos la lista general de categorías para dejar solo las que existen en los posts
    const categoriasActivas = categorias.filter(cat => {
        // En caso de que tengas 'Todas' dentro de tu array original, lo respetamos
        const nombreCat = typeof cat === 'string' ? cat : cat.name;
        return categoriasUsadas.has(nombreCat) || nombreCat === 'Todas';
    });

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (post.category && post.category.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'Todas' || post.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const getThemeColor = (post) => {
        const subCategoryColor = systemColors.find(c => c.item_type === 'sub' && c.item_name === post.category)?.color_hex;
        const mainCategoryColor = systemColors.find(c => c.item_type === 'main' && c.item_name === post.type)?.color_hex;
        return subCategoryColor || mainCategoryColor || '#2563eb';
    };

    const hasFilters = Boolean(searchTerm) || selectedCategory !== 'Todas';

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('Todas');
    };

    return (
        <BrowseShell
            eyebrow="Noticias"
            title="Novedades Turneoo"
            description="Entérate de las últimas actualizaciones, comunicados y noticias."
            search={{
                label: 'Buscar noticias',
                placeholder: 'Buscar artículos o comunicados...',
                value: searchTerm,
                onChange: setSearchTerm,
            }}
            // 3. CAMBIO AQUÍ: Le pasamos al componente de la interfaz solo las categorías con contenido
            categories={categoriasActivas}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
        >
            {filteredPosts.length === 0 ? (
                hasFilters ? (
                    <EmptyState
                        icon={Search}
                        title="No encontramos noticias para este filtro"
                        text="Prueba con otras palabras o revisa otra categoría."
                        action={<button type="button" onClick={clearFilters} className="btn btn-secondary btn-sm">Quitar filtros</button>}
                    />
                ) : (
                    <EmptyState
                        icon={Bell}
                        title="Aún no hay noticias publicadas"
                        text="Cuando haya novedades de Turneoo, las verás aquí."
                    />
                )
            ) : (
                <>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <p aria-live="polite" className="text-sm text-muted">
                            {filteredPosts.length} {filteredPosts.length === 1 ? 'noticia' : 'noticias'}
                        </p>
                        <div className="segmented" role="group" aria-label="Tipo de vista">
                            <button type="button" aria-pressed={viewMode === 'grid'} onClick={() => setViewMode('grid')}>
                                <Grid size={16} aria-hidden="true" /> Cuadrícula
                            </button>
                            <button type="button" aria-pressed={viewMode === 'list'} onClick={() => setViewMode('list')}>
                                <List size={16} aria-hidden="true" /> Feed
                            </button>
                        </div>
                    </div>

                    {viewMode === 'grid' ? (
                        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {filteredPosts.map((post) => (
                                <PostCard
                                    key={post.slug}
                                    post={post}
                                    href={`/noticias/${post.slug}`}
                                    kicker={post.type === 'help' ? 'Tutorial' : 'Noticia'}
                                    excerpt={post.excerpt || 'Sin descripción...'}
                                    themeColor={getThemeColor(post)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex max-w-2xl flex-col gap-6">
                            {filteredPosts.map((post) => (
                                <NewsFeedCard
                                    key={post.slug}
                                    post={post}
                                    href={`/noticias/${post.slug}`}
                                    excerpt={post.excerpt || 'Sin descripción...'}
                                    themeColor={getThemeColor(post)}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </BrowseShell>
    );
}