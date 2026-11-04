import './globals.css';
import Navbar from './Navbar';

export const metadata = {
  title: 'Turneoo Hub',
  description: 'Centro de ayuda y comunidad',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {/* Aquí llamamos a nuestra nueva barra inteligente */}
        <Navbar />
        
        {/* Aquí se renderiza el resto de las páginas */}
        {children}
      </body>
    </html>
  );
}