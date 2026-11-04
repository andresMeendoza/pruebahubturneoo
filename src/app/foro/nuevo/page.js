'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import ForumLayout from '../../../components/ForumLayout';
import RichTextEditor from '../RichTextEditor'; // 👈 IMPORTAMOS EL EDITOR AVANZADO
import { ArrowLeft } from 'react-feather';

export default function NewThreadPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('General');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    
    // Lista de categorías (puedes ajustarlas o traerlas de la BD como en el Hub)
    const [categories, setCategories] = useState(['General', 'Punto de Venta', 'Catálogo', 'Fidelización', 'Soporte']);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login'); // Redirige si no está logueado
            } else {
                setUser(session.user);
            }
        };
        checkUser();
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!title.trim()) return alert('El título es obligatorio.');
        
        // Limpiamos etiquetas HTML para comprobar si realmente hay texto/contenido
        const strippedContent = content.replace(/<[^>]*>?/gm, '').trim();
        if (!strippedContent && !content.includes('<img') && !content.includes('<iframe')) {
            return alert('El contenido no puede estar vacío.');
        }

        setLoading(true);

        const { data, error } = await supabase
            .from('forum_threads')
            .insert([
                { title, category, content, author_id: user.id }
            ])
            .select();

        if (error) {
            alert('Error al crear el tema: ' + error.message);
            setLoading(false);
        } else if (data) {
            // Redirige al usuario al tema recién creado
            router.push(`/foro/${data[0].id}`);
        }
    };

    return (
        <ForumLayout>
            <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
                <Link href="/foro" style={{ color: '#64748b', textDecoration: 'none', marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: '600', transition: 'color 0.2s' }}>
                    <ArrowLeft size={18} /> Volver a la Comunidad
                </Link>

                <div style={{ background: 'white', padding: '3rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <h1 style={{ fontSize: '2.2rem', color: '#0f172a', margin: 0, fontWeight: '800', letterSpacing: '-0.02em' }}>
                            Crear Nuevo Tema
                        </h1>
                        <Link href="/foro" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '600' }}>
                            Cancelar
                        </Link>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#334155', fontWeight: '700', fontSize: '0.95rem' }}>
                                Título de la discusión
                            </label>
                            <input 
                                type="text" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ej. ¿Cómo configuran ustedes las comisionesssss?"
                                style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1.05rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s', background: '#f8fafc' }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#334155', fontWeight: '700', fontSize: '0.95rem' }}>
                                Categoría
                            </label>
                            <select 
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box', background: '#f8fafc', cursor: 'pointer' }}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '3rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#334155', fontWeight: '700', fontSize: '0.95rem' }}>
                                Contenido
                            </label>
                            
                            {/* 👇 AQUÍ HACEMOS LA MAGIA: REEMPLAZAMOS EL TEXTAREA POR TU RICHTEXTEDITOR 👇 */}
                            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                                <RichTextEditor 
                                    content={content} 
                                    onChange={setContent} 
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{ width: '100%', padding: '16px', background: '#3b82f6', color: 'white', borderRadius: '12px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '1.1rem', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)', transition: 'all 0.2s ease' }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 15px rgba(59, 130, 246, 0.3)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(59, 130, 246, 0.2)'; }}
                        >
                            {loading ? 'Publicando Tema...' : 'Publicar Tema'}
                        </button>
                    </form>
                </div>
            </div>
        </ForumLayout>
    );
}