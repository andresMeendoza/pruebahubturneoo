import React, { useEffect } from 'react';
import { useEditor, useEditorState, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageResize from 'tiptap-extension-resize-image';
import Youtube from '@tiptap/extension-youtube';
import toast from 'react-hot-toast';
import { Bold, Image as ImageIcon, Italic, List, Youtube as YoutubeIcon } from 'react-feather';
import { compressImage, IMAGE_ACCEPT, IMAGE_PRESETS } from '../../lib/compressImage';
import { supabase } from '../../lib/supabase';

const MenuBar = ({ editor }) => {
    // Mantiene los botones sincronizados con el formato bajo el cursor
    const active = useEditorState({
        editor,
        selector: ({ editor }) => ({
            bold: editor.isActive('bold'),
            italic: editor.isActive('italic'),
            bulletList: editor.isActive('bulletList'),
        }),
    });

    const handleContentImageUpload = async (e) => {
        const file = e.target.files[0];
        e.target.value = ''; // Permite volver a elegir el mismo archivo
        if (!file) return;

        const toastId = toast.loading("Optimizando imagen...");

        try {
            const { file: optimized, extension } = await compressImage(file, IMAGE_PRESETS.inline);
            toast.loading("Subiendo imagen...", { id: toastId });

            // Lo guardamos en una carpeta separada para el foro
            const fileName = `foro/${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;

            const { error } = await supabase.storage.from('support').upload(fileName, optimized);
            if (error) throw error;

            const { data } = supabase.storage.from('support').getPublicUrl(fileName);

            editor.chain().focus().setImage({ src: data.publicUrl }).run();
            toast.success("Imagen insertada", { id: toastId });
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    };

    const addYoutubeVideo = () => {
        const url = window.prompt('Pega el enlace del video de YouTube:');
        if (url) {
            editor.commands.setYoutubeVideo({ src: url, width: 640, height: 360 });
        }
    };

    const toggleClass = (name) => `editor-btn ${active[name] ? 'is-active' : ''}`;

    return (
        <div className="editor-toolbar" role="toolbar" aria-label="Formato de texto">
            <button type="button" aria-label="Negrita" aria-pressed={active.bold} onClick={() => editor.chain().focus().toggleBold().run()} className={toggleClass('bold')}>
                <Bold size={16} aria-hidden="true" />
            </button>
            <button type="button" aria-label="Cursiva" aria-pressed={active.italic} onClick={() => editor.chain().focus().toggleItalic().run()} className={toggleClass('italic')}>
                <Italic size={16} aria-hidden="true" />
            </button>
            <button type="button" aria-label="Lista" aria-pressed={active.bulletList} onClick={() => editor.chain().focus().toggleBulletList().run()} className={toggleClass('bulletList')}>
                <List size={16} aria-hidden="true" />
            </button>
            <label className="editor-btn" title="Insertar imagen">
                <span className="sr-only">Insertar imagen</span>
                <ImageIcon size={16} aria-hidden="true" />
                <input type="file" accept={IMAGE_ACCEPT} onChange={handleContentImageUpload} className="sr-only" />
            </label>
            <button type="button" aria-label="Insertar video de YouTube" title="Insertar video de YouTube" onClick={addYoutubeVideo} className="editor-btn">
                <YoutubeIcon size={16} aria-hidden="true" />
            </button>
        </div>
    );
};

export default function RichTextEditor({ content, onChange, label = 'Contenido' }) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            ImageResize,
            Youtube.configure({ controls: true, nocookie: true })
        ],
        content: content,
        onUpdate: ({ editor }) => {
            // Cada vez que el usuario escribe, le pasamos el HTML al componente padre
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'tiptap-editor-content prose-content editor-surface',
                role: 'textbox',
                'aria-multiline': 'true',
                'aria-label': label,
            },
        },
    });

    // Sincronizar si el contenido se limpia desde afuera (ej. al enviar el comentario)
    useEffect(() => {
        if (editor && content === '') {
            editor.commands.setContent('');
        }
    }, [content, editor]);

    return (
        <div className="editor">
            {editor && <MenuBar editor={editor} />}
            <EditorContent editor={editor} />
        </div>
    );
}
