'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function ForumLayout({ children }) {
    const [sidebarThreads, setSidebarThreads] = useState([]);
    const { id: currentThreadId } = useParams();

    useEffect(() => {
        const fetchSidebarData = async () => {
            const { data, error } = await supabase
                .from('forum_threads')
                .select('id, title, category')
                .order('created_at', { ascending: false })
                .limit(15);

            if (data && !error) setSidebarThreads(data);
        };

        fetchSidebarData();
    }, []);

    return (
        <div className="page-shell py-6 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 lg:py-10">
            <aside className="hidden self-start lg:sticky lg:top-[calc(var(--nav-offset)+0.5rem)] lg:block lg:max-h-[calc(100dvh-var(--nav-offset)-1.5rem)] lg:overflow-y-auto">
                <h2 className="mb-2 px-3 font-sans text-sm font-semibold tracking-normal text-muted">Temas recientes</h2>
                <nav aria-label="Temas recientes" className="flex flex-col gap-0.5">
                    {sidebarThreads.map((thread) => {
                        const isActive = currentThreadId === thread.id;
                        return (
                            <Link
                                key={thread.id}
                                href={`/foro/${thread.id}`}
                                title={thread.title}
                                aria-current={isActive ? 'page' : undefined}
                                className={`truncate rounded-lg px-3 py-2 text-sm transition-colors ${isActive ? 'bg-brand-soft font-semibold text-brand-hover' : 'text-ink-soft hover:bg-ink/5'}`}
                            >
                                {thread.title}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            <div className="mx-auto w-full min-w-0 max-w-3xl">{children}</div>
        </div>
    );
}
