import Image from 'next/image';
import Link from 'next/link';
import { Instagram } from 'react-feather';
import { WEBSITE_URL } from '../lib/links';

const HUB_LINKS = [
    { href: '/', label: 'Centro de ayuda' },
    { href: '/noticias', label: 'Noticias' },
    { href: '/foro', label: 'Comunidad' },
];

const PRODUCT_LINKS = [
    { href: `${WEBSITE_URL}/agenda`, label: 'Agenda y reservas' },
    { href: `${WEBSITE_URL}/inventario`, label: 'Control de stock' },
    { href: `${WEBSITE_URL}/precios`, label: 'Planes y precios' },
];

const APP_LINKS = [
    { href: 'https://apps.apple.com/us/app/turneoo/id6772565816', label: 'App Store' },
    { href: 'https://play.google.com/store/apps/details?id=com.turneoo.app', label: 'Google Play' },
];

const linkClass = 'text-sm text-muted transition-colors hover:text-brand';

function FooterColumn({ title, children }) {
    return (
        <div>
            <h2 className="mb-3 font-sans text-sm font-bold tracking-normal text-ink">{title}</h2>
            <ul className="space-y-2">{children}</ul>
        </div>
    );
}

export default function SiteFooter() {
    return (
        <footer className="mt-12 border-t border-line bg-surface">
            <div className="page-shell grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
                <div className="max-w-xs">
                    <Image src="/logo.png" alt="Turneoo" width={701} height={121} className="h-6 w-auto" />
                    <p className="mt-3 text-sm text-muted">
                        El sistema operativo para negocios de servicios. Automatiza tu agenda, cobros y fidelización en una sola plataforma.
                    </p>
                    <a
                        href="https://www.instagram.com/turneoolatam"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Turneoo en Instagram"
                        className="mt-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-line-strong hover:text-brand"
                    >
                        <Instagram size={18} aria-hidden="true" />
                    </a>
                </div>

                <FooterColumn title="Hub">
                    {HUB_LINKS.map((link) => (
                        <li key={link.href}><Link href={link.href} className={linkClass}>{link.label}</Link></li>
                    ))}
                </FooterColumn>

                <FooterColumn title="Producto">
                    {PRODUCT_LINKS.map((link) => (
                        <li key={link.href}><a href={link.href} className={linkClass}>{link.label}</a></li>
                    ))}
                </FooterColumn>

                <FooterColumn title="Descarga la app">
                    {APP_LINKS.map((link) => (
                        <li key={link.href}>
                            <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>{link.label}</a>
                        </li>
                    ))}
                </FooterColumn>
            </div>

            <div className="border-t border-line">
                <div className="page-shell flex flex-wrap items-center justify-between gap-2 py-4 text-sm text-muted">
                    <p>© {new Date().getFullYear()} Turneoo Inc.</p>
                    <a href={`${WEBSITE_URL}/privacy`} className="transition-colors hover:text-brand">Privacidad</a>
                </div>
            </div>
        </footer>
    );
}
