import Link from 'next/link';
import { FileText } from 'react-feather';
import EmptyState from '../components/EmptyState';

export const metadata = { title: 'Página no encontrada' };

export default function NotFound() {
    return (
        <div className="page-shell py-10">
            <EmptyState
                icon={FileText}
                title="No encontramos esta página"
                text="Puede que el enlace haya cambiado o que el contenido ya no esté disponible."
                action={<Link href="/" className="btn btn-primary btn-sm">Volver al inicio</Link>}
            />
        </div>
    );
}
