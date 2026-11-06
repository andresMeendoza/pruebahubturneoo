'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, MessageSquare, Plus } from 'react-feather';
import { supabase } from '../lib/supabase';
import { formatDate } from '../lib/format';
import EmptyState from './EmptyState';

export default function ForumClient({ threads }) {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        // Verificar si hay un usuario logueado
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
        };
        checkUser();
    }, []);

    const handleNewThread = () => {
        if (!user) {
            // Si no está logueado, lo mandamos al login
            router.push('/login?next=/foro/nuevo');
        } else {
            // Si está logueado, lo mandamos al formulario de crear tema
            router.push('/foro/nuevo');
        }
    };

    return (
        <>
            <section className="hero-surface border-b border-line">
                <div className="page-shell flex flex-col gap-5 py-10 sm:flex-row sm:items-end sm:justify-between sm:py-14">
                    <div className="max-w-2xl">
                        <p className="eyebrow mb-2">Comunidad</p>
                        <h1 className="text-4xl font-extrabold text-ink sm:text-5xl">Comunidad Turneoo</h1>
                        <p className="mt-3 text-lg text-muted">
                            Comparte ideas, haz preguntas y conecta con otros negocios.
                        </p>
                    </div>
                    <button type="button" onClick={handleNewThread} className="btn btn-primary self-start sm:self-auto">
                        <Plus size={18} aria-hidden="true" /> Nuevo tema
                    </button>
                </div>
            </section>

            <div className="page-shell py-6 lg:py-10">
                <div>
                    {threads.length === 0 ? (
                        <EmptyState
                            icon={MessageSquare}
                            title="Aún no hay temas en el foro"
                            text="¡Sé el primero en iniciar una discusión!"
                        />
                    ) : (
                        <ul className="card divide-y divide-line overflow-hidden">
                            {threads.map((thread) => (
                                <li key={thread.id}>
                                    <Link href={`/foro/${thread.id}`} className="group flex items-center gap-4 p-5 transition-colors hover:bg-canvas">
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1.5 flex flex-wrap items-center gap-2">
                                                <span className="tag">{thread.category}</span>
                                                <span className="text-[0.8125rem] text-muted">{formatDate(thread.created_at)}</span>
                                            </div>
                                            <h2 className="text-lg font-bold text-ink group-hover:text-brand-hover">{thread.title}</h2>
                                        </div>
                                        <ChevronRight size={20} aria-hidden="true" className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
}
