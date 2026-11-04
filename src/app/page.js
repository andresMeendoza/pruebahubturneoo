'use client'; 

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { Search, Compass } from 'react-feather';

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [loading, setLoading] = useState(true);
    const [categorias, setCategorias] = useState(['Todas']);

    useEffect(() => {
        let isMounted = true; 

        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Cargar Posts incluyendo is_pinned y ordenando
                const { data: postsData, error: postsError } = await supabase
                    .from('hub_posts')
                    .select('title, slug, type, created_at, cover_image, category, is_pinned')
                    .eq('status', 'published')
                    .eq('type', 'help')
                    .order('is_pinned', { ascending: false }) // 1ro: Destacados arriba
                    .order('created_at', { ascending: false }); // 2do: Luego por fecha

                if (postsError) throw postsError;
                if (isMounted && postsData) setPosts(postsData);

                // 2. Cargar Categorías Dinámicas
                const { data: catData, error: catError } = await supabase
                    .from('hub_categories')
                    .select('name')
                    .order('name');
                
                if (catError) throw catError;
                
                if (isMounted && catData) {
                    const dbCategories = catData.map(c => c.name);
                    setCategorias(['Todas', ...dbCategories]); 
                }
            } catch (error) {
                console.error("Error cargando el Hub:", error.message);
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
            
            {/* BARRA LATERAL */}
            <aside style={{ 
                width: '280px', borderRight: '1px solid #e2e8f0', background: '#ffffff',
                position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', padding: '2.5rem 1.5rem',
                boxShadow: '4px 0 24px rgba(0, 0, 0, 0.02)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem', fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>
                    <Compass size={20} color="#3b82f6" /> Explorar Hub
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
                    
                    <header style={{ marginBottom: '3.5rem', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '2.8rem', color: '#0f172a', marginBottom: '1rem', fontWeight: '800', letterSpacing: '-0.025em' }}>
                            ¿Cómo podemos ayudarte hoy?
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '1.05rem', marginBottom: '2rem' }}>
                            Explora tutoriales, noticias y guías para dominar la plataforma.
                        </p>
                        
                        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                                <Search size={20} />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Buscar temas, configuraciones o tips..." 
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
                    </header>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Cargando información...</div>
                    ) : filteredPosts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                            <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0 }}>
                                {searchTerm || selectedCategory !== 'Todas' 
                                    ? 'No encontramos artículos para este filtro.' 
                                    : 'Aún no hay artículos publicados.'}
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                            {filteredPosts.map((post) => {
                                const fecha = post.created_at ? new Date(post.created_at) : new Date();
                                const formattedDate = fecha.toLocaleDateString('es-ES', {
                                    year: 'numeric', month: 'long', day: 'numeric'
                                });
                                const isTutorial = post.type === 'help';

                                return (
                                    <Link 
                                        href={`/blog/${post.slug}`} 
                                        key={post.slug}
                                        style={{ 
                                            display: 'flex', flexDirection: 'column', background: 'white', 
                                            borderRadius: '16px', textDecoration: 'none',
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03), 0 2px 4px -2px rgba(0,0,0,0.03)',
                                            border: '1px solid #e2e8f0', overflow: 'hidden', transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.08)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.03), 0 2px 4px -2px rgba(0,0,0,0.03)'; }}
                                    >
                                        <div style={{ 
                                            height: '180px', backgroundColor: '#e2e8f0', 
                                            backgroundImage: post.cover_image ? `url(${post.cover_image})` : 'none',
                                            backgroundSize: 'cover', backgroundPosition: 'center',
                                            display: 'flex', alignItems: 'flex-end', padding: '1rem', position: 'relative'
                                        }}>
                                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.6) 0%, transparent 70%)' }} />
                                            
                                            {/* ETIQUETA DE DESTACADO */}
                                            {post.is_pinned && (
                                                <span style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2, background: '#eab308', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                                                    📌 Destacado
                                                </span>
                                            )}

                                            {post.category && (
                                                <span style={{ position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid rgba(255,255,255,0.3)' }}>
                                                    {post.category}
                                                </span>
                                            )}
                                        </div>

                                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ marginBottom: '0.75rem' }}>
                                                    <span style={{ 
                                                        background: isTutorial ? '#fff7ed' : '#eff6ff', 
                                                        color: isTutorial ? '#ea580c' : '#2563eb', 
                                                        padding: '4px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' 
                                                    }}>
                                                        {isTutorial ? 'Tutorial' : 'Noticia'}
                                                    </span>
                                                </div>
                                                <h2 style={{ color: '#0f172a', fontSize: '1.2rem', marginBottom: '0.75rem', lineHeight: '1.4', fontWeight: '800' }}>
                                                    {post.title}
                                                </h2>
                                            </div>
                                            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0, fontWeight: '500' }}>
                                                {formattedDate}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}