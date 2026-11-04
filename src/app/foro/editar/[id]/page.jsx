'use client';
export const runtime = 'edge';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../../lib/supabase';
import ForumLayout from '../../../../components/ForumLayout';
import RichTextEditor from '../../RichTextEditor';
import { ArrowLeft } from 'react-feather';

export default function EditThreadPage() {
    const { id } = useParams();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('General');
    const [content, setContent] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);

    const [categories] = useState(['General', 'Punto de Venta', 'Catálogo', 'Fidelización', 'Soporte']);

    useEffect(() => {
        const fetchThread = async () => {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push('/login');
                return;
            }
            setUser(session.user);

            // Traer los datos del tema
            const { data: threadData, error } = await supabase
                .from('forum_threads')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !threadData) {
                alert('Tema no encontrado.');
                router.push('/foro');
                return;
            }

            // Verificar que el usuario actual sea el autor
            if (threadData.author_id !== session.user.id) {
                alert('No tienes permiso para editar este tema.');
                router.push(`/foro/${id}`);
                return;
            }

            // 🚀 PROTECCIÓN: Si viene null de la BD, lo forzamos a ser un string vacío ''
            setTitle(threadData.title || '');
            setCategory(threadData.category || 'General');
            setContent(threadData.content || '');
            setLoading(false);
        };

        if (id) fetchThread();
    }, [id, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // 🚀 PROTECCIÓN ABSOLUTA contra crasheos silenciosos
            const safeTitle = title || '';
            const safeContent = content || '';

            if (!safeTitle.trim()) {
                alert('El título es obligatorio.');
                return;
            }

            const strippedContent = safeContent.replace(/<[^>]*>?/gm, '').trim();
            if (!strippedContent && !safeContent.includes('<img') && !safeContent.includes('<iframe')) {
                alert('El contenido no puede estar vacío.');
                return;
            }

            setSaving(true);

            const { error } = await supabase
                .from('forum_threads')
                .update({ 
                    title: safeTitle, 
                    category: category, 
                    content: safeContent 
                })
                .eq('id', id);

            if (error) {
                alert('Error al actualizar el tema: ' + error.message);
                setSaving(false);
            } else {
                // Forzamos la recarga real del navegador para saltar el caché de Next.js
                window.location.href = `/foro/${id}`;
            }

        } catch (err) {
            // Si algo explota en JS, ahora sí nos avisará y no se quedará congelado
            console.error("Error inesperado:", err);
            alert("Ocurrió un error inesperado al guardar: " + err.message);
            setSaving(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Cargando datos del tema...</div>;

    return (
        <ForumLayout>
            <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
                <Link href={`/foro/${id}`} style={{ color: '#64748b', textDecoration: 'none', marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: '600', transition: 'color 0.2s' }}>
                    <ArrowLeft size={18} /> Volver al Tema
                </Link>

                <div style={{ background: 'white', padding: '3rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <h1 style={{ fontSize: '2.2rem', color: '#0f172a', margin: 0, fontWeight: '800', letterSpacing: '-0.02em' }}>
                            Editar Tema
                        </h1>
                        <Link href={`/foro/${id}`} style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '600' }}>
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
                            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                                <RichTextEditor
                                    content={content}
                                    onChange={setContent}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            style={{ width: '100%', padding: '16px', background: '#3b82f6', color: 'white', borderRadius: '12px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '1.1rem', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)', transition: 'all 0.2s ease' }}
                        >
                            {saving ? 'Actualizando...' : 'Guardar Cambios'}
                        </button>
                    </form>
                </div>
            </div>
        </ForumLayout>
    );
}