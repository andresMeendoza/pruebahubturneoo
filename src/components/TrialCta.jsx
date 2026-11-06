import { ArrowRight } from 'react-feather';
import { SIGNUP_URL } from '../lib/links';

export default function TrialCta({ className = '' }) {
    return (
        <aside className={`card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between ${className}`}>
            <div>
                <p className="font-semibold text-ink">
                    ¿Aún no tienes Turneoo? Empieza con <span className="text-brand">30 días de prueba gratis</span>.
                </p>
                <p className="mt-0.5 text-sm text-muted">No requiere tarjeta de crédito. Soporte en español.</p>
            </div>
            <a href={SIGNUP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-pill shrink-0 font-bold">
                Crear cuenta gratis <ArrowRight size={16} aria-hidden="true" />
            </a>
        </aside>
    );
}
