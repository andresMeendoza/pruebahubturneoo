'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; 
import Link from 'next/link';
import { supabase } from '../../../lib/supabase'; 
import RichTextEditor from '../RichTextEditor'; 
import { ArrowLeft, MessageCircle, Trash2, CornerDownRight, Edit3 } from 'react-feather';
import ForumLayout from '../../../components/ForumLayout';


const ReplyNode = ({ reply, allReplies, authors, user, replyingToId, setReplyingToId, nestedReplyText, setNestedReplyText, handleSubmitReply, handleDeleteReply, isReplying, depth = 0 }) => {
    const replyAuthorName = authors[reply.author_id] || 'Usuario Anónimo';
    const nestedReplies = allReplies.filter(r => r.parent_id === reply.id);

    return (
        <div style={{ 
            background: depth === 0 ? 'white' : 'transparent', 
            padding: depth === 0 ? '2rem' : '1.5rem 0 0 0', 
            borderRadius: depth === 0 ? '16px' : '0', 
            boxShadow: depth === 0 ? '0 4px 6px -1px rgba(0,0,0,0.03)' : 'none', 
            border: depth === 0 ? '1px solid #e2e8f0' : 'none',
        }}>
            <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ 
                        width: '36px', height: '36px', borderRadius: '50%', 
                        background: depth === 0 ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : '#cbd5e1', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        color: 'white', fontWeight: 'bold', fontSize: '0.9rem', flexShrink: 0,
                        boxShadow: depth === 0 ? '0 2px 4px rgba(59, 130, 246, 0.3)' : 'none'
                    }}>
                        {replyAuthorName.charAt(0).toUpperCase()}
                    </div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{ color: '#0f172a', fontWeight: '700', fontSize: '0.95rem' }}>{replyAuthorName}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '500' }}>
                            {new Date(reply.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                    </div>

                    <div 
                        style={{ color: '#334155', lineHeight: '1.7', fontSize: '1rem', marginBottom: '12px' }}
                        dangerouslySetInnerHTML={{ __html: reply.content }}
                    />

                    <div style={{ display: 'flex', gap: '16px', marginBottom: '0.5rem' }}>
                        {user && (
                            <button 
                                onClick={() => setReplyingToId(replyingToId === reply.id ? null : reply.id)}
                                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.2s', ...(replyingToId === reply.id ? { background: '#f1f5f9', color: '#0f172a' } : {}) }}
                            >
                                <CornerDownRight size={14} /> {replyingToId === reply.id ? 'Cancelar' : 'Responder'}
                            </button>
                        )}

                        {user && user.id === reply.author_id && (
                            <button 
                                onClick={() => handleDeleteReply(reply.id)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.2s' }}
                            >
                                <Trash2 size={14} /> Eliminar
                            </button>
                        )}
                    </div>

                    {replyingToId === reply.id && (
                        <form onSubmit={(e) => handleSubmitReply(e, reply.id)} style={{ marginBottom: '1.5rem', marginTop: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <RichTextEditor 
                                    content={nestedReplyText} 
                                    onChange={setNestedReplyText} 
                                />
                            </div>
                            <button type="submit" disabled={isReplying} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 2px 4px rgba(59,130,246,0.2)' }}>
                                {isReplying ? 'Enviando...' : 'Enviar respuesta'}
                            </button>
                        </form>
                    )}

                    {nestedReplies.length > 0 && (
                        <div style={{ borderLeft: '2px solid #e2e8f0', paddingLeft: '1.5rem', marginTop: '1rem', display: 'flex', flexDirection: 'column' }}>
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

export default function ThreadPage() {
    const { id } = useParams(); 
    const router = useRouter(); 
    const [thread, setThread] = useState(null);
    const [replies, setReplies] = useState([]);
    
    const [newReply, setNewReply] = useState('');
    const [replyingToId, setReplyingToId] = useState(null); 
    const [nestedReplyText, setNestedReplyText] = useState(''); 
    
    const [loading, setLoading] = useState(true);
    const [isReplying, setIsReplying] = useState(false);
    const [user, setUser] = useState(null);
    const [authors, setAuthors] = useState({}); 

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);

            const { data: threadData } = await supabase.from('forum_threads').select('*').eq('id', id).single();
            const { data: repliesData } = await supabase.from('forum_replies').select('*').eq('thread_id', id).order('created_at', { ascending: true });

            if (threadData) setThread(threadData);
            if (repliesData) setReplies(repliesData);

            const authorIds = new Set();
            if (threadData) authorIds.add(threadData.author_id);
            if (repliesData) repliesData.forEach(r => authorIds.add(r.author_id));

            if (authorIds.size > 0) {
                const { data: orgsData } = await supabase.from('organizations').select('owner_id, name').in('owner_id', Array.from(authorIds));
                const authorMap = {};
                if (orgsData) {
                    orgsData.forEach(org => { authorMap[org.owner_id] = org.name; });
                }
                setAuthors(authorMap);
            }
            setLoading(false);
        };
        if (id) fetchData();
    }, [id]);

    const handleSubmitReply = async (e, parentId = null) => {
        e.preventDefault();
        const contentToSubmit = parentId ? nestedReplyText : newReply;
        
        const strippedContent = contentToSubmit.replace(/<[^>]*>?/gm, '').trim();
        if (!strippedContent || !user) return;
        
        setIsReplying(true);

        const { data, error } = await supabase
            .from('forum_replies')
            .insert([{ thread_id: id, content: contentToSubmit, author_id: user.id, parent_id: parentId }])
            .select();

        if (error) {
            alert('Error al publicar respuesta: ' + error.message);
        } else if (data) {
            setReplies([...replies, data[0]]);
            setNewReply(''); 
            setNestedReplyText('');
            setReplyingToId(null);
            
            if (!authors[user.id]) {
                const { data: myOrg } = await supabase.from('organizations').select('name').eq('owner_id', user.id).maybeSingle();
                if (myOrg) setAuthors(prev => ({ ...prev, [user.id]: myOrg.name }));
            }
        }
        setIsReplying(false);
    };

    const handleDeleteReply = async (replyId) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este comentario?')) return;
        const { error } = await supabase.from('forum_replies').delete().eq('id', replyId);
        if (error) {
            alert('Error al eliminar: ' + error.message);
        } else {
            setReplies(replies.filter(r => r.id !== replyId && r.parent_id !== replyId));
        }
    };

    const handleDeleteThread = async () => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar TODA esta publicación? Esta acción no se puede deshacer.')) return;
        
        const { error } = await supabase.from('forum_threads').delete().eq('id', id);
        
        if (error) {
            alert('Error al eliminar la publicación: ' + error.message);
        } else {
            router.push('/foro'); 
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Cargando discusión...</div>;
    if (!thread) return <div style={{ textAlign: 'center', padding: '4rem' }}><h2 style={{ color: '#0f172a' }}>Tema no encontrado</h2><Link href="/foro" style={{ color: '#3b82f6', textDecoration: 'none' }}>Volver al foro</Link></div>;

    const threadAuthorName = authors[thread.author_id] || 'Usuario Anónimo';
    const mainReplies = replies.filter(r => !r.parent_id);

    return (
        <ForumLayout>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <Link href="/foro" style={{ color: '#64748b', textDecoration: 'none', marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: '600', transition: 'color 0.2s' }}>
                    <ArrowLeft size={18} /> Volver a la Comunidad
                </Link>

                <div style={{ background: 'white', padding: '3rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', marginBottom: '3rem' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                        <span style={{ display: 'inline-block', background: '#eff6ff', color: '#2563eb', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {thread.category}
                        </span>

                        {user && user.id === thread.author_id && (
    <div style={{ display: 'flex', gap: '8px' }}>
        <Link 
            href={`/foro/editar/${thread.id}`}
            style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', padding: '8px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', transition: 'all 0.2s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#94a3b8'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
        >
            <Edit3 size={16} /> Editar
        </Link>

        <button 
            onClick={handleDeleteThread}
            style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', padding: '8px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
        >
            <Trash2 size={16} /> Eliminar
        </button>
    </div>
)}
                    </div>

                    <h1 style={{ fontSize: '2.5rem', color: '#0f172a', marginTop: 0, marginBottom: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
                        {thread.title}
                    </h1>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2.5rem', paddingBottom: '2rem', borderBottom: '1px solid #e2e8f0' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            {threadAuthorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p style={{ margin: 0, color: '#0f172a', fontWeight: '700', fontSize: '1rem' }}>{threadAuthorName}</p>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}>
                                Publicado el {new Date(thread.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    
                    <div 
                        className="tiptap-content"
                        style={{ color: '#334155', lineHeight: '1.8', fontSize: '1.1rem' }} 
                        dangerouslySetInnerHTML={{ __html: thread.content }}
                    />
                </div>

                <div style={{ marginTop: '4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                        <MessageCircle size={24} color="#0f172a" />
                        <h3 style={{ color: '#0f172a', fontSize: '1.5rem', margin: 0, fontWeight: '800' }}>Respuestas ({replies.length})</h3>
                    </div>

                    {mainReplies.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '4rem' }}>
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
                        <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1', marginBottom: '4rem' }}>
                            <p style={{ color: '#64748b', margin: 0, fontSize: '1.1rem' }}>Aún no hay respuestas. ¡Sé el primero en aportar a la comunidad!</p>
                        </div>
                    )}

                    {user ? (
                        <div style={{ background: 'white', padding: '2.5rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                            <h4 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', fontSize: '1.2rem', fontWeight: '800' }}>Escribe una respuesta</h4>
                            <form onSubmit={(e) => handleSubmitReply(e, null)}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <RichTextEditor 
                                        content={newReply} 
                                        onChange={setNewReply} 
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isReplying} 
                                    style={{ padding: '12px 24px', background: '#3b82f6', color: 'white', borderRadius: '10px', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '1rem', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)', transition: 'all 0.2s ease' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(59, 130, 246, 0.3)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(59, 130, 246, 0.2)'; }}
                                >
                                    {isReplying ? 'Enviando...' : 'Publicar Respuesta'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div style={{ background: '#f8fafc', padding: '3rem', borderRadius: '20px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ color: '#0f172a', marginBottom: '1rem', fontSize: '1.2rem' }}>Únete a la conversación</h4>
                            <p style={{ color: '#64748b', marginBottom: '2rem' }}>Inicia sesión en tu cuenta de Turneoo para poder responder y conectar con otros negocios.</p>
                            <Link href="/login" style={{ padding: '12px 28px', background: '#3b82f6', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: '600', display: 'inline-block', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)' }}>
                                Iniciar Sesión
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </ForumLayout>
    );
}