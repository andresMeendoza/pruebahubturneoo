# Turneoo Hub

Centro de ayuda, noticias y comunidad de Turneoo. Hecho con Next.js 16, React 19, Tailwind CSS 4 y Supabase.

## Puesta en marcha

1. Crea `.env.local` en la raíz:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-publica

   # Obligatoria en producción: la usan el sitemap, robots y las URL canónicas
   NEXT_PUBLIC_SITE_URL=https://tu-dominio-del-hub.com

   # Opcional
   NEXT_PUBLIC_APP_URL=https://app.turneoo.com
   ```

2. Instala las dependencias. Por ahora hace falta esta opción porque `@cloudflare/next-on-pages` no admite Next 16:

   ```bash
   npm install --legacy-peer-deps
   ```

3. Arranca el proyecto:

   ```bash
   npm run dev
   ```

## Base de datos

Las migraciones están en `supabase/migrations`. Ejecútalas en el SQL Editor de Supabase. El sitio funciona sin la última, pero sin orden manual de módulos, sin progreso por cuenta y sin extractos ligeros.

Tablas que usa el Hub: `hub_posts`, `hub_categories`, `hub_colors`, `hub_lesson_progress`, `forum_threads`, `forum_replies` y `organizations`. Los artículos, las categorías, sus colores y el orden de los módulos se administran desde la sección Blog del panel de administración de Turneoo.

## Estructura

| Ruta | Contenido |
|---|---|
| `/` | Academia: módulos (categorías) y progreso |
| `/ayuda/[slug]` | Lección (tutoriales). Si es una noticia, redirige a `/noticias/[slug]` |
| `/noticias`, `/noticias/[slug]` | Noticias |
| `/foro`, `/foro/[id]`, `/foro/nuevo`, `/foro/editar/[id]` | Comunidad |
| `/login` | Inicio de sesión |

- `src/app/globals.css`: colores, tipografía y componentes base.
- `src/components`: componentes compartidos.
- `src/lib/sanitize.js`: limpieza obligatoria de todo HTML guardado antes de mostrarlo. Cualquier `dangerouslySetInnerHTML` nuevo debe pasar por `sanitizeHtml`.
- `src/lib/color.js`: herencia de colores de `hub_colors` y ajuste de contraste.
