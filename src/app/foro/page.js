'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function ForumPage() {
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        // Verificar si hay un usuario logueado
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
        };

        const fetchThreads = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('forum_threads')
                .select('id, title, category, created_at')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setThreads(data);
            }
            setLoading(false);
        };

        checkUser();
        fetchThreads();
    }, []);

    const handleNewThread = () => {
        if (!user) {
            // Si no está logueado, lo mandamos al login
            router.push('/login');
        } else {
            // Si está logueado, lo mandamos al formulario de crear tema
            router.push('/foro/nuevo');
        }
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '4rem 2rem' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', color: '#0f172a', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
                            Comunidad Turneoo
                        </h1>
                        <p style={{ color: '#64748b', margin: 0, fontSize: '1.1rem' }}>
                            Comparte ideas, haz preguntas y conecta con otros negocios.
                        </p>
                    </div>
                    
                    {/* Botón protegido para crear tema */}
                    <button 
                        onClick={handleNewThread}
                        style={{ padding: '12px 24px', background: '#0f172a', color: 'white', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}
                    >
                        + Nuevo Tema
                    </button>
                </header>

                <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    {loading ? (
                        <p style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Cargando discusiones...</p>
                    ) : threads.length === 0 ? (
                        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                            <h3 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>Aún no hay temas en el foro</h3>
                            <p style={{ color: '#64748b' }}>¡Sé el primero en iniciar una discusión!</p>
                        </div>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {threads.map((thread) => (
                                <li key={thread.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <Link href={`/foro/${thread.id}`} style={{ display: 'block', padding: '1.5rem', textDecoration: 'none', transition: 'background 0.2s' }}>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                                            <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                {thread.category}
                                            </span>
                                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                                {new Date(thread.created_at).toLocaleDateString('es-ES')}
                                            </span>
                                        </div>
                                        <h2 style={{ color: '#0f172a', fontSize: '1.25rem', margin: 0 }}>
                                            {thread.title}
                                        </h2>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>
        </div>
    );
}