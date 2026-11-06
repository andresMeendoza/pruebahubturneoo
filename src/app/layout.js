import { Bricolage_Grotesque, Instrument_Sans } from 'next/font/google';
import './globals.css';
import Navbar from './Navbar';
import AppToaster from '../components/AppToaster';
import SiteFooter from '../components/SiteFooter';
import { SITE_URL } from '../lib/links';

const headingFont = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const bodyFont = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const DESCRIPTION = 'Tutoriales, noticias y comunidad para sacarle todo el provecho a Turneoo.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Turneoo Hub: centro de ayuda y comunidad',
    template: '%s | Turneoo Hub',
  },
  description: DESCRIPTION,
  openGraph: {
    siteName: 'Turneoo Hub',
    locale: 'es_LA',
    type: 'website',
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body>
        <a href="#contenido" className="skip-link">Saltar al contenido</a>
        <Navbar />
        <main id="contenido" className="pt-[var(--nav-offset)]">{children}</main>
        <SiteFooter />
        <AppToaster />
      </body>
    </html>
  );
}
