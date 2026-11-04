'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../lib/supabase'; 

export default function HubTutorialLayout({ children }) {
    const [hubPosts, setHubPosts] = useState({ tutoriales: [], noticias: [] });
    // Usamos 'slug' en lugar de 'id' porque las rutas de tu blog son /blog/[slug]
    const { slug: currentSlug } = useParams(); 

    useEffect(() => {
        const fetchSidebarPosts = async () => {
            // Buscamos los artículos reales del Hub
            const { data, error } = await supabase
                .from('hub_posts')
                .select('title, slug, type')
                .eq('status', 'published')
                .order('created_at', { ascending: false })
                .limit(20);
                
            if (data && !error) {
                // Filtramos y agrupamos por el tipo de etiqueta
                const tutoriales = data.filter(p => p.type === 'help');
                const noticias = data.filter(p => p.type === 'blog');
                setHubPosts({ tutoriales, noticias });
            }
        };
        
        fetchSidebarPosts();
    }, []);

    // Función para renderizar los enlaces y aplicar el estilo azul si es el artículo actual
    const renderLinks = (posts) => {
        return posts.map(post => {
            const isActive = currentSlug === post.slug;
            return (
                <Link 
                    key={post.slug}
                    href={`/blog/${post.slug}`} 
                    style={{ 
                        textDecoration: 'none', 
                        color: isActive ? '#2563eb' : '#334155', 
                        background: isActive ? '#eff6ff' : 'transparent',
                        padding: '8px 12px', 
                        borderRadius: '6px', 
                        fontSize: '0.9rem', 
                        fontWeight: isActive ? '600' : '400',
                        transition: 'background 0.2s',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block'
                    }}
                    title={post.title} 
                >
                    {post.title}
                </Link>
            );
        });
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            
            <aside style={{ 
                width: '280px', 
                borderRight: '1px solid #e2e8f0', 
                background: '#f8fafc',
                position: 'sticky', 
                top: 0, 
                height: '100vh', 
                overflowY: 'auto',
                padding: '2rem 1.5rem'
            }}>
                <div style={{ marginBottom: '1.5rem', fontWeight: 'bold', fontSize: '1.1rem', color: '#0f172a' }}>
                    📚 Contenido
                </div>
                
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    
                    {/* Sección de Tutoriales */}
                    {hubPosts.tutoriales.length > 0 && (
                        <>
                            <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', marginTop: '1rem', marginBottom: '0.5rem' }}>
                                Tutoriales
                            </div>
                            {renderLinks(hubPosts.tutoriales)}
                        </>
                    )}

                    {/* Sección de Noticias */}
                    {hubPosts.noticias.length > 0 && (
                        <>
                            <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                                Noticias
                            </div>
                            {renderLinks(hubPosts.noticias)}
                        </>
                    )}

                </nav>
            </aside>

            <main style={{ flex: 1, padding: '4rem 2rem', overflowY: 'auto' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}