'use client';
export const runtime = 'edge';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase'; // Ajusta los ../ si tu archivo supabase.js está en otro lado
import { ArrowLeft } from 'react-feather';

export default function LectorNoticiaPage() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('hub_posts')
                .select('*')
                .eq('slug', slug)
                .single();

            if (data) setPost(data);
            setLoading(false);
        };
        if (slug) fetchPost();
    }, [slug]);

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Cargando noticia...</div>;
    if (!post) return <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Noticia no encontrada.</div>;

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '4rem 2rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '4rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                
                {/* BOTÓN DE VOLVER */}
                <Link href="/noticias" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', marginBottom: '3rem', fontWeight: '600', transition: 'color 0.2s' }}>
                    <ArrowLeft size={18} /> Volver a Noticias
                </Link>

                <div style={{ marginBottom: '3rem' }}>
                    {post.category && (
                        <span style={{ background: '#3b82f6', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {post.category}
                        </span>
                    )}
                    <h1 style={{ fontSize: '3rem', color: '#0f172a', marginTop: '1.5rem', marginBottom: '1rem', fontWeight: '800', lineHeight: '1.2', letterSpacing: '-0.02em' }}>
                        {post.title}
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: '500' }}>
                        {new Date(post.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {post.cover_image && (
                    <div style={{ width: '100%', height: '400px', backgroundImage: `url(${post.cover_image})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '16px', marginBottom: '3rem' }} />
                )}

                {/* CONTENIDO DEL ARTÍCULO (TIPTAP) */}
                <div 
                    className="tiptap-content"
                    style={{ color: '#334155', lineHeight: '1.8', fontSize: '1.15rem' }}
                    dangerouslySetInnerHTML={{ __html: post.content }} 
                />
            </div>
        </div>
    );
}