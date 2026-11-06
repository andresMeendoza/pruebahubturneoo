export const metadata = {
  // Un título simple aquí anularía la plantilla en cada noticia.
  title: { default: 'Noticias', template: '%s | Turneoo Hub' },
  description: 'Últimas actualizaciones, comunicados y novedades de Turneoo.',
  alternates: { canonical: '/noticias' },
};

export default function NoticiasLayout({ children }) {
  return children;
}
