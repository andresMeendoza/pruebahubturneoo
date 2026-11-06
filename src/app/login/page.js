'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, Eye, EyeOff, MessageSquare, Plus } from 'react-feather';
import { supabase } from '../../lib/supabase';
import { APP_URL, SIGNUP_URL } from '../../lib/links';

const DEFAULT_DESTINATION = '/foro';

const BENEFITS = [
    { icon: MessageSquare, text: 'Responde y conversa con otros negocios en el foro' },
    { icon: Plus, text: 'Publica tus propios temas y preguntas' },
    { icon: BookOpen, text: 'Guarda tu progreso de la academia en todos tus dispositivos' },
];

// Solo se aceptan rutas internas, para que un enlace no pueda sacar a nadie del Hub.
function getDestination() {
    const next = new URLSearchParams(window.location.search).get('next');
    const isInternal = next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\');
    return isInternal && !next.startsWith('/login') ? next : DEFAULT_DESTINATION;
}

function getErrorMessage(error) {
    if (error.code === 'email_not_confirmed') {
        return 'Tu correo aún no está confirmado. Revisa tu bandeja de entrada.';
    }
    if (error.status === 429 || error.code === 'over_request_rate_limit') {
        return 'Demasiados intentos. Espera unos minutos y vuelve a probar.';
    }
    if (error.code === 'invalid_credentials') {
        return 'El correo o la contraseña no son correctos.';
    }
    return 'No pudimos iniciar sesión. Revisa tu conexión e inténtalo de nuevo.';
}

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Quien ya tiene sesión no necesita ver este formulario.
    useEffect(() => {
        const redirectIfSignedIn = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) router.replace(getDestination());
        };
        redirectIfSignedIn();
    }, [router]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });

        if (error) {
            setError(getErrorMessage(error));
            setLoading(false);
        } else {
            router.replace(getDestination());
        }
    };

    return (
        <div className="hero-surface flex min-h-dvh items-center justify-center px-4 pb-10">
            <div className="card grid w-full max-w-4xl overflow-hidden !rounded-3xl shadow-pop lg:grid-cols-[5fr_6fr]">
                <aside className="hidden flex-col bg-ink p-10 text-white lg:flex">
                    <p className="text-sm font-semibold text-white/70">Turneoo Hub</p>
                    <h2 className="mt-2 text-3xl font-extrabold">Únete a la conversación</h2>
                    <p className="mt-3 text-white/70">
                        Los tutoriales y las noticias son abiertos. Solo necesitas iniciar sesión para participar.
                    </p>

                    <ul className="mt-8 space-y-4">
                        {BENEFITS.map(({ icon: Icon, text }) => (
                            <li key={text} className="flex items-start gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                                    <Icon size={17} aria-hidden="true" />
                                </span>
                                <span className="pt-1.5 text-[0.9375rem] leading-snug">{text}</span>
                            </li>
                        ))}
                    </ul>

                    <Link href="/" className="mt-auto inline-flex items-center gap-1.5 pt-10 text-sm font-semibold text-white/80 transition-colors hover:text-white">
                        Seguir sin iniciar sesión <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                </aside>

                <div className="p-6 sm:p-10">
                    <span className="tag tag-brand">Acceso al Hub</span>
                    <h1 className="mt-3 text-3xl font-extrabold text-ink">Entra a la comunidad</h1>
                    <p className="mt-1.5 text-muted">Usa el mismo correo y contraseña de tu cuenta de Turneoo.</p>

                    {error && (
                        <p role="alert" className="mt-5 rounded-lg bg-danger-soft px-3 py-2.5 text-sm font-medium text-danger">
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleLogin} className="mt-6 space-y-4">
                        <div>
                            <label htmlFor="email" className="field-label">Correo electrónico</label>
                            <input
                                id="email"
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                placeholder="tu@correo.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="field-input"
                            />
                        </div>

                        <div>
                            <div className="mb-1.5 flex items-baseline justify-between gap-3">
                                <label htmlFor="password" className="field-label !mb-0">Contraseña</label>
                                <a href={`${APP_URL}/login`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand hover:text-brand-hover">
                                    ¿La olvidaste?
                                </a>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="field-input !pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    aria-pressed={showPassword}
                                    className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-colors hover:bg-canvas hover:text-ink"
                                >
                                    {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn btn-primary btn-block !mt-6">
                            {loading ? 'Entrando...' : 'Entrar al Hub'}
                        </button>
                    </form>

                    <div className="mt-6 space-y-2 border-t border-line pt-5 text-sm text-muted">
                        <p>
                            ¿Quieres administrar tu negocio?{' '}
                            <a href={`${APP_URL}/login`} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand hover:text-brand-hover">
                                Ve a la app de Turneoo
                            </a>
                        </p>
                        <p>
                            ¿Aún no tienes cuenta?{' '}
                            <a href={SIGNUP_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand hover:text-brand-hover">
                                Prueba Turneoo gratis
                            </a>
                        </p>
                    </div>

                    <Link href="/" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-ink lg:hidden">
                        Seguir sin iniciar sesión <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
