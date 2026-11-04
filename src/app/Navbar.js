'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [businessName, setBusinessName] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async (currentUser) => {
            if (!currentUser) {
                setUser(null);
                setBusinessName('');
                return;
            }
            setUser(currentUser);

            // 1. Buscamos primero en metadatos
            let name = currentUser.user_metadata?.nombre_negocio || currentUser.user_metadata?.name;

            // 2. Si no hay, buscamos en tu tabla 'organizations'
            try {
                const { data, error } = await supabase
                    .from('organizations')
                    .select('name')
                    .eq('owner_id', currentUser.id) // Usando 'id' como veo que lo ajustaste
                    .maybeSingle(); // <-- CAMBIA .single() POR .maybeSingle()

                if (error) {
                    console.error("❌ Error de Supabase al buscar negocio:", error.message);
                }

                if (data && data.name) {
                    console.log("✅ Negocio encontrado:", data.name);
                    name = data.name;
                }
            } catch (err) {
                console.error("❌ Error en el código:", err);
            }

            // 3. Respaldo final si todo falla
            setBusinessName(name || currentUser.email.split('@')[0]);
        };

        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            fetchUserData(session?.user);
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            fetchUserData(session?.user);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <Link href="/" style={{ textDecoration: 'none', color: '#0f172a', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    Turneoo <span style={{ color: '#3b82f6' }}>Hub</span>
                </Link>
                <Link href="/noticias" style={{ color: '#64748b', textDecoration: 'none', fontWeight: '500', fontSize: '0.95rem' }}>
                    Noticias
                </Link>
                <Link href="/foro" style={{ textDecoration: 'none', color: '#475569', fontWeight: '500', fontSize: '1rem' }}>
                    Comunidad / Foro
                </Link>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '28px', height: '28px', background: '#3b82f6', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                {businessName.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: '600' }}>
                                {businessName}
                            </span>
                        </div>

                        <button
                            onClick={handleLogout}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}
                        >
                            Cerrar sesión
                        </button>
                    </div>
                ) : (
                    <Link href="/login" style={{ textDecoration: 'none', color: '#3b82f6', fontSize: '0.9rem', fontWeight: '600' }}>
                        Iniciar sesión
                    </Link>
                )}

                <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer" style={{ background: '#0f172a', color: 'white', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    Administrar
                </a>
            </div>
        </nav>
    );
}