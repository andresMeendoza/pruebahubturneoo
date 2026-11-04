'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../lib/supabase'; // Ajusta la ruta si es necesario

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
        <div style={{ display: 'flex', minHeight: '100vh', background: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            
            <aside style={{ 
                width: '280px', 
                borderRight: '1px solid #e2e8f0', 
                background: '#f8fafc',
                position: 'sticky', 
                top: 0, 
                height: '100vh', 
                overflowY: 'auto',
                padding: '2rem 1.5rem'
            }}>
                <div style={{ marginBottom: '1.5rem', fontWeight: 'bold', fontSize: '1.1rem', color: '#0f172a' }}>
                    💬 Temas Recientes
                </div>
                
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {sidebarThreads.map(thread => {
                        const isActive = currentThreadId === thread.id;
                        return (
                            <Link 
                                key={thread.id}
                                href={`/foro/${thread.id}`} 
                                style={{ 
                                    textDecoration: 'none', 
                                    color: isActive ? '#2563eb' : '#334155', 
                                    background: isActive ? '#eff6ff' : 'transparent',
                                    padding: '8px 12px', 
                                    borderRadius: '6px', 
                                    fontSize: '0.9rem', 
                                    fontWeight: isActive ? '600' : '400',
                                    transition: 'background 0.2s',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                                title={thread.title}
                            >
                                {thread.title}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            <main style={{ flex: 1, padding: '4rem 2rem', overflowY: 'auto' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}