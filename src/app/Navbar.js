'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, BookOpen, ExternalLink, LogOut, Menu, MessageSquare, X } from 'react-feather';
import { supabase } from '../lib/supabase';
import { APP_URL, SIGNUP_URL } from '../lib/links';
import Avatar from '../components/Avatar';

const NAV_LINKS = [
    { href: '/', label: 'Ayuda', icon: BookOpen, tone: 'bg-blue-100 text-blue-600', isActive: (path) => path === '/' || path.startsWith('/ayuda') },
    { href: '/noticias', label: 'Noticias', icon: Bell, tone: 'bg-amber-100 text-amber-700', isActive: (path) => path.startsWith('/noticias') },
    { href: '/foro', label: 'Comunidad', icon: MessageSquare, tone: 'bg-emerald-100 text-emerald-700', isActive: (path) => path.startsWith('/foro') },
];

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [businessName, setBusinessName] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

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
                    .eq('owner_id', currentUser.id)
                    // Un dueño puede tener varios negocios: se muestra siempre el más antiguo.
                    .order('created_at', { ascending: true })
                    .limit(1)
                    .maybeSingle();

                if (error) {
                    console.error("❌ Error de Supabase al buscar negocio:", error.message);
                }

                if (data && data.name) {
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

    useEffect(() => {
        if (!menuOpen) return undefined;
        const closeOnEscape = (e) => {
            if (e.key === 'Escape') setMenuOpen(false);
        };
        window.addEventListener('keydown', closeOnEscape);
        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [menuOpen]);

    const closeMenu = () => setMenuOpen(false);
    const loginHref = pathname === '/login' ? '/login' : `/login?next=${encodeURIComponent(pathname)}`;

    const handleLogout = async () => {
        closeMenu();
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <header className="fixed inset-x-0 top-3 z-50 px-3 md:top-4 md:px-6">
            {menuOpen && <div aria-hidden="true" onClick={closeMenu} className="fixed inset-0 lg:hidden" />}

            <div className="nav-glass relative mx-auto flex h-16 max-w-[85rem] items-center justify-between rounded-full px-5 md:h-20 md:px-8 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-4">
                <Link href="/" onClick={closeMenu} aria-label="Turneoo Hub, inicio" className="flex items-center gap-2 justify-self-start rounded-md">
                    <Image src="/logo.png" alt="" width={701} height={121} priority className="h-6 w-auto md:h-7" />
                    <span className="text-sm font-semibold text-brand md:text-base">Hub</span>
                </Link>

                <nav aria-label="Principal" className="nav-group hidden items-center gap-1 rounded-full px-2 py-1.5 lg:flex">
                    {NAV_LINKS.map((link) => (
                        <Link key={link.href} href={link.href} aria-current={link.isActive(pathname) ? 'page' : undefined} className="nav-link">
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden items-center gap-3 justify-self-end lg:flex">
                    {user ? (
                        <>
                            <span className="flex items-center gap-2">
                                <Avatar name={businessName} size="sm" />
                                <span className="max-w-32 truncate text-sm font-semibold text-ink">{businessName}</span>
                            </span>
                            <button type="button" onClick={handleLogout} className="rounded-full px-3 py-2 text-sm font-bold text-slate-600 transition-colors hover:text-ink">
                                Salir
                            </button>
                            <a href={APP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-pill !min-h-10 !px-5 font-bold">
                                Administrar <ExternalLink size={14} aria-hidden="true" />
                            </a>
                        </>
                    ) : (
                        <>
                            <Link href={loginHref} className="rounded-full px-4 py-2 text-[0.9375rem] font-bold text-slate-600 transition-colors hover:text-ink">
                                Entrar
                            </Link>
                            <a href={SIGNUP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-pill !min-h-10 !px-5 font-bold">
                                Probar gratis
                            </a>
                        </>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-expanded={menuOpen}
                    aria-controls="menu-movil"
                    aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/50 text-slate-800 shadow-sm transition-colors hover:bg-white lg:hidden"
                >
                    {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
                </button>
            </div>

            {menuOpen && (
                <div id="menu-movil" className="relative mx-auto mt-3 max-h-[calc(100dvh-6.5rem)] max-w-[85rem] overflow-y-auto rounded-3xl border border-line bg-surface p-4 shadow-pop lg:hidden">
                    <p className="mb-2 px-1 text-xs font-bold text-muted">Navegación</p>
                    <nav aria-label="Principal móvil" className="flex flex-col gap-2">
                        {NAV_LINKS.map((link) => {
                            const Icon = link.icon;
                            const active = link.isActive(pathname);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={closeMenu}
                                    aria-current={active ? 'page' : undefined}
                                    className={`flex items-center gap-3 rounded-2xl p-3 font-bold transition-colors ${active ? 'bg-brand-soft text-brand-hover' : 'bg-canvas text-ink-soft hover:bg-line/60'}`}
                                >
                                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${link.tone}`}>
                                        <Icon size={18} aria-hidden="true" />
                                    </span>
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-4 border-t border-line pt-4">
                        {user && (
                            <p className="mb-3 flex items-center gap-2 px-1">
                                <Avatar name={businessName} size="sm" />
                                <span className="truncate text-sm font-semibold text-ink">{businessName}</span>
                            </p>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                            {user ? (
                                <>
                                    <button type="button" onClick={handleLogout} className="btn btn-secondary !rounded-2xl font-bold">
                                        <LogOut size={16} aria-hidden="true" /> Salir
                                    </button>
                                    <a href={APP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-dark !rounded-2xl font-bold">
                                        Administrar
                                    </a>
                                </>
                            ) : (
                                <>
                                    <Link href={loginHref} onClick={closeMenu} className="btn btn-secondary !rounded-2xl font-bold">Entrar</Link>
                                    <a href={SIGNUP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-dark !rounded-2xl font-bold">
                                        Crear cuenta
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
