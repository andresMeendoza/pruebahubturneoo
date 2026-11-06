export const metadata = {
  // Un título simple aquí anularía la plantilla en los temas y formularios del foro.
  title: { default: 'Comunidad', template: '%s | Turneoo Hub' },
  description: 'Comparte ideas, haz preguntas y conecta con otros negocios que usan Turneoo.',
  alternates: { canonical: '/foro' },
};

export default function ForoLayout({ children }) {
  return children;
}
