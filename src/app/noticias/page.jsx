'use client'; 

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { Search, Compass, Grid, List } from 'react-feather'; // 👈 Importamos Grid y List

export default function NoticiasPage() {
    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [loading, setLoading] = useState(true);
    const [categorias, setCategorias] = useState(['Todas']);
    const [systemColors, setSystemColors] = useState([]);
    
    // 🚀 NUEVO ESTADO PARA CONTROLAR LA VISTA ('grid' o 'list')
    const [viewMode, setViewMode] = useState('grid'); 

    useEffect(() => {
        let isMounted = true; 

        const fetchData = async () => {
            setLoading(true);
            try {
                const { data: postsData, error: postsError } = await supabase
                    .from('hub_posts')
                    .select('title, slug, type, created_at, cover_image, category, is_pinned, content')
                    .eq('status', 'published')
                    .eq('type', 'blog') 
                    .order('is_pinned', { ascending: false }) 
                    .order('created_at', { ascending: false }); 

                if (postsError) throw postsError;
                if (isMounted && postsData) setPosts(postsData);

                const { data: catData, error: catError } = await supabase
                    .from('hub_categories')
                    .select('name')
                    .order('name');
                
                if (catError) throw catError;
                
                if (isMounted && catData) {
                    const dbCategories = catData.map(c => c.name);
                    setCategorias(['Todas', ...dbCategories]); 
                }

                const { data: colorData, error: colorError } = await supabase
                    .from('hub_colors')
                    .select('*');

                if (colorError) throw colorError;
                if (isMounted && colorData) setSystemColors(colorData);

            } catch (error) {
                console.error("Error cargando noticias:", error.message);
                if (isMounted) setCategorias(['Todas']);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, []);

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (post.category && post.category.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'Todas' || post.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            
            {/* BARRA LATERAL (Sin cambios) */}
            <aside style={{ 
                width: '280px', borderRight: '1px solid #e2e8f0', background: '#ffffff',
                position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', padding: '2.5rem 1.5rem',
                boxShadow: '4px 0 24px rgba(0, 0, 0, 0.02)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem', fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>
                    <Compass size={20} color="#3b82f6" /> Explorar Noticias
                </div>
                
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', paddingLeft: '8px' }}>
                        Categorías
                    </div>
                    {categorias.map(cat => {
                        const isActive = selectedCategory === cat;
                        return (
                            <button 
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                style={{ 
                                    textDecoration: 'none', color: isActive ? '#1d4ed8' : '#475569', 
                                    background: isActive ? '#eff6ff' : 'transparent', padding: '10px 14px', 
                                    borderRadius: '8px', fontSize: '0.9rem', fontWeight: isActive ? '600' : '500',
                                    border: 'none', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s ease',
                                    display: 'block', width: '100%'
                                }}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </nav>
            </aside>

            {/* COLUMNA CENTRAL */}
            <main style={{ flex: 1, padding: '4rem 3rem', overflowY: 'auto' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    
                    <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '2.8rem', color: '#0f172a', marginBottom: '1rem', fontWeight: '800', letterSpacing: '-0.025em' }}>
                            Novedades Turneoo
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '1.05rem', marginBottom: '2rem' }}>
                            Entérate de las últimas actualizaciones, comunicados y noticias.
                        </p>
                        
                        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                                <Search size={20} />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Buscar artículos o comunicados..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ 
                                    width: '100%', padding: '1.1rem 1.5rem 1.1rem 3.5rem', fontSize: '1.05rem', 
                                    borderRadius: '9999px', border: '1px solid #cbd5e1', 
                                    backgroundColor: '#ffffff', color: '#0f172a',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)', outline: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                            />
                        </div>

                        {/* 🚀 SELECTOR DE VISTA (GRID vs LIST) */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '2rem' }}>
                            <button 
                                onClick={() => setViewMode('grid')}
                                style={{ 
                                    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '99px',
                                    background: viewMode === 'grid' ? '#0f172a' : '#f1f5f9', 
                                    color: viewMode === 'grid' ? 'white' : '#64748b',
                                    border: 'none', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', fontSize: '0.9rem'
                                }}
                            >
                                <Grid size={16} /> Cuadrícula
                            </button>
                            <button 
                                onClick={() => setViewMode('list')}
                                style={{ 
                                    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '99px',
                                    background: viewMode === 'list' ? '#0f172a' : '#f1f5f9', 
                                    color: viewMode === 'list' ? 'white' : '#64748b',
                                    border: 'none', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', fontSize: '0.9rem'
                                }}
                            >
                                <List size={16} /> Feed Detallado
                            </button>
                        </div>
                    </header>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Cargando noticias...</div>
                    ) : filteredPosts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                            <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0 }}>
                                {searchTerm || selectedCategory !== 'Todas' 
                                    ? 'No encontramos noticias para este filtro.' 
                                    : 'Aún no hay noticias publicadas.'}
                            </p>
                        </div>
                    ) : (
                        
                        /* 🚀 RENDERIZADO CONDICIONAL DE LA VISTA */
                        viewMode === 'grid' ? (
                            
                            /* ===============================
                               VISTA 1: CUADRÍCULA (ORIGINAL)
                               =============================== */
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                                {filteredPosts.map((post) => {
                                    const fecha = post.created_at ? new Date(post.created_at) : new Date();
                                    const formattedDate = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
                                    const subCategoryColor = systemColors?.find(c => c.item_type === 'sub' && c.item_name === post.category)?.color_hex;
                                    const mainCategoryColor = systemColors?.find(c => c.item_type === 'main' && c.item_name === post.type)?.color_hex;
                                    const themeColor = subCategoryColor || mainCategoryColor || '#3b82f6';
                                    const plainTextContent = post.content ? post.content.replace(/<[^>]*>?/gm, '').trim() : 'Sin descripción...';

                                    return (
                                        <Link href={`/noticias/${post.slug}`} key={post.slug} style={{ display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '16px', textDecoration: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', overflow: 'hidden', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.08)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.03)'; }}>
                                            <div style={{ height: '180px', backgroundColor: themeColor, backgroundImage: post.cover_image ? `url(${post.cover_image})` : `linear-gradient(135deg, ${themeColor} 0%, #0f172a 100%)`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'flex-end', padding: '1rem', position: 'relative' }}>
                                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.6) 0%, transparent 70%)' }} />
                                                {post.is_pinned && <span style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2, background: '#eab308', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>📌 Destacado</span>}
                                                {post.category && <span style={{ position: 'relative', zIndex: 1, background: themeColor, color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', border: `1px solid ${themeColor}` }}>{post.category}</span>}
                                            </div>
                                            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ color: themeColor, fontWeight: '800', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{post.type === 'help' ? 'TUTORIAL' : 'NOTICIA'}</span>
                                                <h2 style={{ color: '#0f172a', fontSize: '1.2rem', marginBottom: '0.75rem', lineHeight: '1.3', fontWeight: '800' }}>{post.title}</h2>
                                                <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 1.5rem 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{plainTextContent}</p>
                                                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 'auto 0 0 0', fontWeight: '500' }}>{formattedDate}</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>

                        ) : (

                            /* ===============================
                               VISTA 2: FEED (TIPO FACEBOOK)
                               =============================== */
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '700px', margin: '0 auto' }}>
                                {filteredPosts.map((post) => {
                                    const fecha = post.created_at ? new Date(post.created_at) : new Date();
                                    const formattedDate = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
                                    const subCategoryColor = systemColors?.find(c => c.item_type === 'sub' && c.item_name === post.category)?.color_hex;
                                    const mainCategoryColor = systemColors?.find(c => c.item_type === 'main' && c.item_name === post.type)?.color_hex;
                                    const themeColor = subCategoryColor || mainCategoryColor || '#3b82f6';
                                    const plainTextContent = post.content ? post.content.replace(/<[^>]*>?/gm, '').trim() : 'Sin descripción...';

                                    return (
                                        <Link href={`/noticias/${post.slug}`} key={post.slug} style={{ display: 'block', background: 'white', borderRadius: '16px', textDecoration: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', overflow: 'hidden', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.08)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.03)'; }}>
                                            
                                            {/* Cabecera del Post (Avatar/Categoría y Fecha) */}
                                            <div style={{ padding: '1.5rem 1.5rem 1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                                        {post.category ? post.category.charAt(0).toUpperCase() : 'N'}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>{post.category || 'Novedades'}</div>
                                                        <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '500' }}>{formattedDate}</div>
                                                    </div>
                                                </div>
                                                {post.is_pinned && <span style={{ background: '#fef9c3', color: '#a16207', padding: '4px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '800' }}>📌 Destacado</span>}
                                            </div>

                                            {/* Texto del Post */}
                                            <div style={{ padding: '0 1.5rem 1rem 1.5rem' }}>
                                                <h2 style={{ color: '#0f172a', fontSize: '1.5rem', marginBottom: '0.75rem', lineHeight: '1.3', fontWeight: '800' }}>{post.title}</h2>
                                                <p style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.6', margin: 0, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {plainTextContent}
                                                </p>
                                            </div>

                                            {/* Imagen del Post (Abarca todo el ancho) */}
                                            {post.cover_image && (
                                                <div style={{ width: '100%', height: '350px', backgroundImage: `url(${post.cover_image})`, backgroundSize: 'cover', backgroundPosition: 'center', borderTop: '1px solid #f1f5f9' }} />
                                            )}
                                            
                                            {/* Pie del Post */}
                                            <div style={{ padding: '1rem 1.5rem', borderTop: post.cover_image ? 'none' : '1px solid #f1f5f9', background: '#f8fafc', color: themeColor, fontWeight: '700', fontSize: '0.9rem', textAlign: 'center' }}>
                                                Leer comunicado completo &rarr;
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )
                    )}
                </div>
            </main>
        </div>
    );
}