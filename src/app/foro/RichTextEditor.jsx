import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageResize from 'tiptap-extension-resize-image';
import Youtube from '@tiptap/extension-youtube';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const MenuBar = ({ editor }) => {
    if (!editor) return null;

    const btnStyle = {
        padding: '4px 8px', marginRight: '6px', borderRadius: '4px',
        border: '1px solid #e4e4e7', background: '#ffffff', cursor: 'pointer',
        color: '#09090b', fontSize: '0.85rem', fontWeight: '500'
    };
    const activeBtnStyle = { ...btnStyle, background: '#e0e7ff', borderColor: '#3b82f6', color: '#1d4ed8' };

    const handleContentImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const toastId = toast.loading("Subiendo imagen...");

        try {
            const fileExt = file.name.split('.').pop();
            // Lo guardamos en una carpeta separada para el foro
            const fileName = `foro/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { error } = await supabase.storage.from('support').upload(fileName, file);
            if (error) throw error;

            const { data } = supabase.storage.from('support').getPublicUrl(fileName);
            
            editor.chain().focus().setImage({ src: data.publicUrl }).run();
            toast.success("Imagen insertada", { id: toastId });
        } catch (error) {
            toast.error("Error al subir: " + error.message, { id: toastId });
        }
    };

    const addYoutubeVideo = () => {
        const url = window.prompt('Pega el enlace del video de YouTube:');
        if (url) {
            editor.commands.setYoutubeVideo({ src: url, width: 640, height: 360 });
        }
    };

    return (
        <div style={{ padding: '8px', borderBottom: '1px solid #e4e4e7', background: '#f8fafc', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={editor.isActive('bold') ? activeBtnStyle : btnStyle}>B</button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={editor.isActive('italic') ? activeBtnStyle : btnStyle}>I</button>
            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={editor.isActive('bulletList') ? activeBtnStyle : btnStyle}>Lista</button>
            
            <label style={btnStyle} title="Insertar imagen">
                📷
                <input type="file" accept="image/*" onChange={handleContentImageUpload} style={{ display: 'none' }} />
            </label>
            <button type="button" onClick={addYoutubeVideo} style={btnStyle} title="Video YouTube">🎥</button>
        </div>
    );
};

export default function RichTextEditor({ content, onChange, placeholder = "Escribe aquí..." }) {
    const editor = useEditor({
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
                class: 'tiptap-editor-content',
                style: 'min-height: 150px; max-height: 400px; overflow-y: auto; padding: 1rem; outline: none; color: #09090b;'
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
        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}