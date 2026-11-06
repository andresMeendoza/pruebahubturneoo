'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CornerDownRight, Edit3, MessageCircle, Trash2 } from 'react-feather';
import toast from 'react-hot-toast';
import { supabase } from '../../../lib/supabase';
import { hasVisibleContent } from '../../../lib/academy';
import { formatDate } from '../../../lib/format';
import { sanitizeHtml } from '../../../lib/sanitize';
import RichTextEditor from '../RichTextEditor';
import Avatar from '../../../components/Avatar';
import EmptyState from '../../../components/EmptyState';
import ForumLayout from '../../../components/ForumLayout';

const ReplyNode = ({ reply, allReplies, authors, user, replyingToId, setReplyingToId, nestedReplyText, setNestedReplyText, handleSubmitReply, handleDeleteReply, isReplying, depth = 0 }) => {
    const replyAuthorName = authors[reply.author_id] || 'Usuario Anónimo';
    const nestedReplies = allReplies.filter(r => r.parent_id === reply.id);
    const isOpen = replyingToId === reply.id;

    return (
        <div className={depth === 0 ? 'card p-4 sm:p-6' : 'pt-5'}>
            <div className="flex gap-3">
                <Avatar name={replyAuthorName} size="sm" tone={depth === 0 ? 'brand' : 'soft'} />

                <div className="min-w-0 flex-1">
                    <p className="mb-1 flex flex-wrap items-baseline gap-x-2">
                        <span className="text-[0.9375rem] font-semibold text-ink">{replyAuthorName}</span>
                        <span className="text-[0.8125rem] text-muted">
                            {formatDate(reply.created_at, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                    </p>

                    <div
                        className="prose-content !text-base"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(reply.content) }}
                    />

                    {user && (
                        <div className="-ml-2 mt-2 flex flex-wrap gap-1">
                            <button
                                type="button"
                                aria-expanded={isOpen}
                                onClick={() => setReplyingToId(isOpen ? null : reply.id)}
                                className="btn btn-ghost btn-sm"
                            >
                                <CornerDownRight size={14} aria-hidden="true" /> {isOpen ? 'Cancelar' : 'Responder'}
                            </button>

                            {user.id === reply.author_id && (
                                <button
                                    type="button"
                                    onClick={() => handleDeleteReply(reply.id)}
                                    className="btn btn-danger-ghost btn-sm"
                                >
                                    <Trash2 size={14} aria-hidden="true" /> Eliminar
                                </button>
                            )}
                        </div>
                    )}

                    {isOpen && (
                        <form onSubmit={(e) => handleSubmitReply(e, reply.id)} className="mt-3 space-y-3">
                            <RichTextEditor
                                content={nestedReplyText}
                                onChange={setNestedReplyText}
                                label={`Respuesta a ${replyAuthorName}`}
                            />
                            <button type="submit" disabled={isReplying} className="btn btn-primary btn-sm">
                                {isReplying ? 'Enviando...' : 'Enviar respuesta'}
                            </button>
                        </form>
                    )}

                    {nestedReplies.length > 0 && (
                        <div className="mt-2 flex flex-col border-l-2 border-line pl-3 sm:pl-5">
                            {nestedReplies.map(nested => (
                                <ReplyNode
                                    key={nested.id}
                                    reply={nested}
                                    allReplies={allReplies}
                                    authors={authors}
                                    user={user}
                                    replyingToId={replyingToId}
                                    setReplyingToId={setReplyingToId}
                                    nestedReplyText={nestedReplyText}
                                    setNestedReplyText={setNestedReplyText}
                                    handleSubmitReply={handleSubmitReply}
                                    handleDeleteReply={handleDeleteReply}
                                    isReplying={isReplying}
                                    depth={depth + 1}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function ThreadClient({ thread, initialReplies, initialAuthors }) {
    const { id } = thread;
    const router = useRouter();
    const [replies, setReplies] = useState(initialReplies);

    const [newReply, setNewReply] = useState('');
    const [replyingToId, setReplyingToId] = useState(null);
    const [nestedReplyText, setNestedReplyText] = useState('');

    const [isReplying, setIsReplying] = useState(false);
    const [user, setUser] = useState(null);
    const [authors, setAuthors] = useState(initialAuthors);

    useEffect(() => {
        const loadSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
        };
        loadSession();
    }, []);

    const handleSubmitReply = async (e, parentId = null) => {
        e.preventDefault();
        const contentToSubmit = parentId ? nestedReplyText : newReply;

        if (!user) return;
        if (!hasVisibleContent(contentToSubmit)) {
            toast.error('Escribe algo o agrega una imagen antes de responder.');
            return;
        }

        setIsReplying(true);

        const { data, error } = await supabase
            .from('forum_replies')
            .insert([{ thread_id: id, content: contentToSubmit, author_id: user.id, parent_id: parentId }])
            .select();

        if (error) {
            toast.error('Error al publicar respuesta: ' + error.message);
        } else if (data) {
            setReplies([...replies, data[0]]);
            setNewReply('');
            setNestedReplyText('');
            setReplyingToId(null);

            if (!authors[user.id]) {
                const { data: myOrg } = await supabase.from('organizations').select('name').eq('owner_id', user.id).order('created_at', { ascending: true }).limit(1).maybeSingle();
                if (myOrg) setAuthors(prev => ({ ...prev, [user.id]: myOrg.name }));
            }
        }
        setIsReplying(false);
    };

    const handleDeleteReply = async (replyId) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este comentario?')) return;
        const { error } = await supabase.from('forum_replies').delete().eq('id', replyId);
        if (error) {
            toast.error('Error al eliminar: ' + error.message);
        } else {
            // Quita también todas las respuestas anidadas, a cualquier nivel, para que el contador cuadre.
            const removed = new Set([replyId]);
            let grew = true;
            while (grew) {
                grew = false;
                replies.forEach((r) => {
                    if (removed.has(r.parent_id) && !removed.has(r.id)) {
                        removed.add(r.id);
                        grew = true;
                    }
                });
            }
            setReplies(replies.filter((r) => !removed.has(r.id)));
        }
    };

    const handleDeleteThread = async () => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar TODA esta publicación? Esta acción no se puede deshacer.')) return;

        const { error } = await supabase.from('forum_threads').delete().eq('id', id);

        if (error) {
            toast.error('Error al eliminar la publicación: ' + error.message);
        } else {
            router.push('/foro');
        }
    };

    const threadAuthorName = authors[thread.author_id] || 'Usuario Anónimo';
    const mainReplies = replies.filter(r => !r.parent_id);

    return (
        <ForumLayout>
            <Link href="/foro" className="btn btn-ghost btn-sm -ml-2 mb-5">
                <ArrowLeft size={16} aria-hidden="true" /> Volver a la Comunidad
            </Link>

            <article className="card p-5 sm:p-8">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <span className="tag tag-brand">{thread.category}</span>

                    {user && user.id === thread.author_id && (
                        <div className="flex gap-2">
                            <Link href={`/foro/editar/${thread.id}`} className="btn btn-secondary btn-sm">
                                <Edit3 size={14} aria-hidden="true" /> Editar
                            </Link>
                            <button type="button" onClick={handleDeleteThread} className="btn btn-danger btn-sm">
                                <Trash2 size={14} aria-hidden="true" /> Eliminar
                            </button>
                        </div>
                    )}
                </div>

                <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">{thread.title}</h1>

                <div className="mt-4 flex items-center gap-3 border-b border-line pb-5">
                    <Avatar name={threadAuthorName} tone="ink" />
                    <div>
                        <p className="font-semibold text-ink">{threadAuthorName}</p>
                        <p className="text-[0.8125rem] text-muted">Publicado el {formatDate(thread.created_at)}</p>
                    </div>
                </div>

                <div
                    className="prose-content tiptap-content mt-5"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(thread.content) }}
                />
            </article>

            <section aria-labelledby="respuestas" className="mt-10">
                <h2 id="respuestas" className="mb-4 flex items-center gap-2 text-2xl font-bold text-ink">
                    <MessageCircle size={22} aria-hidden="true" /> Respuestas ({replies.length})
                </h2>

                {mainReplies.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        {mainReplies.map((reply) => (
                            <ReplyNode
                                key={reply.id}
                                reply={reply}
                                allReplies={replies}
                                authors={authors}
                                user={user}
                                replyingToId={replyingToId}
                                setReplyingToId={setReplyingToId}
                                nestedReplyText={nestedReplyText}
                                setNestedReplyText={setNestedReplyText}
                                handleSubmitReply={handleSubmitReply}
                                handleDeleteReply={handleDeleteReply}
                                isReplying={isReplying}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={MessageCircle}
                        title="Aún no hay respuestas"
                        text="¡Sé el primero en aportar a la comunidad!"
                    />
                )}

                <div className="card mt-6 p-5 sm:p-6">
                    {user ? (
                        <>
                            <h3 className="mb-3 text-lg font-bold text-ink">Escribe una respuesta</h3>
                            <form onSubmit={(e) => handleSubmitReply(e, null)} className="space-y-3">
                                <RichTextEditor content={newReply} onChange={setNewReply} label="Tu respuesta" />
                                <button type="submit" disabled={isReplying} className="btn btn-primary">
                                    {isReplying ? 'Enviando...' : 'Publicar respuesta'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-ink">Únete a la conversación</h3>
                                <p className="mt-1 text-muted">Inicia sesión en tu cuenta de Turneoo para responder y conectar con otros negocios.</p>
                            </div>
                            <Link href={`/login?next=/foro/${thread.id}`} className="btn btn-primary shrink-0">Iniciar sesión</Link>
                        </div>
                    )}
                </div>
            </section>
        </ForumLayout>
    );
}
