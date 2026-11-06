'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { supabase } from '../../../../lib/supabase';
import ForumLayout from '../../../../components/ForumLayout';
import ThreadForm from '../../ThreadForm';
import { useForumCategories } from '../../useForumCategories';

export default function EditThreadPage() {
    const { id } = useParams();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('General');
    const [content, setContent] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const categories = useForumCategories(category);

    useEffect(() => {
        const fetchThread = async () => {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push(`/login?next=/foro/editar/${id}`);
                return;
            }

            // Traer los datos del tema
            const { data: threadData, error } = await supabase
                .from('forum_threads')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !threadData) {
                toast.error('Tema no encontrado.');
                router.push('/foro');
                return;
            }

            // Verificar que el usuario actual sea el autor
            if (threadData.author_id !== session.user.id) {
                toast.error('No tienes permiso para editar este tema.');
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
                toast.error('El título es obligatorio.');
                return;
            }

            const strippedContent = safeContent.replace(/<[^>]*>?/gm, '').trim();
            if (!strippedContent && !safeContent.includes('<img') && !safeContent.includes('<iframe')) {
                toast.error('El contenido no puede estar vacío.');
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
                toast.error('Error al actualizar el tema: ' + error.message);
                setSaving(false);
            } else {
                // Forzamos la recarga real del navegador para saltar el caché de Next.js
                window.location.href = `/foro/${id}`;
            }

        } catch (err) {
            // Si algo explota en JS, ahora sí nos avisará y no se quedará congelado
            console.error("Error inesperado:", err);
            toast.error("Ocurrió un error inesperado al guardar: " + err.message);
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div role="status" aria-label="Cargando datos del tema" className="mx-auto max-w-3xl space-y-4 px-4 py-10 sm:px-6">
                <div className="skeleton h-10 w-1/2" />
                <div className="skeleton h-12 w-full" />
                <div className="skeleton h-12 w-full" />
                <div className="skeleton h-48 w-full" />
            </div>
        );
    }

    return (
        <ForumLayout>
            <ThreadForm
                heading="Editar tema"
                backHref={`/foro/${id}`}
                backLabel="Volver al tema"
                title={title}
                onTitleChange={setTitle}
                category={category}
                onCategoryChange={setCategory}
                categories={categories}
                content={content}
                onContentChange={setContent}
                submitting={saving}
                submitLabel="Guardar cambios"
                submittingLabel="Actualizando..."
                onSubmit={handleSubmit}
            />
        </ForumLayout>
    );
}
