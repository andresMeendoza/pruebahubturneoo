'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { supabase } from '../../../lib/supabase';
import ForumLayout from '../../../components/ForumLayout';
import ThreadForm from '../ThreadForm';
import { useForumCategories } from '../useForumCategories';

export default function NewThreadPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('General');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const categories = useForumCategories(category);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login?next=/foro/nuevo'); // Redirige si no está logueado
            } else {
                setUser(session.user);
            }
        };
        checkUser();
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error('El título es obligatorio.');
            return;
        }

        // Limpiamos etiquetas HTML para comprobar si realmente hay texto/contenido
        const strippedContent = content.replace(/<[^>]*>?/gm, '').trim();
        if (!strippedContent && !content.includes('<img') && !content.includes('<iframe')) {
            toast.error('El contenido no puede estar vacío.');
            return;
        }

        setLoading(true);

        const { data, error } = await supabase
            .from('forum_threads')
            .insert([
                { title, category, content, author_id: user.id }
            ])
            .select();

        if (error) {
            toast.error('Error al crear el tema: ' + error.message);
            setLoading(false);
        } else if (data) {
            // Redirige al usuario al tema recién creado
            router.push(`/foro/${data[0].id}`);
        }
    };

    return (
        <ForumLayout>
            <ThreadForm
                heading="Crear nuevo tema"
                backHref="/foro"
                backLabel="Volver a la Comunidad"
                title={title}
                onTitleChange={setTitle}
                titlePlaceholder="Ej. ¿Cómo configuran ustedes las comisiones?"
                category={category}
                onCategoryChange={setCategory}
                categories={categories}
                content={content}
                onContentChange={setContent}
                submitting={loading}
                submitLabel="Publicar tema"
                submittingLabel="Publicando tema..."
                onSubmit={handleSubmit}
            />
        </ForumLayout>
    );
}
