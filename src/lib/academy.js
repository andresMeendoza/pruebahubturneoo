import { resolveColor } from './color';

export const DEFAULT_MODULE = 'General';

const byDate = (a, b) => new Date(a.created_at) - new Date(b.created_at);

// Primero el orden manual del panel; lo que no lo tenga va al final, por nombre.
const byModuleOrder = (a, b) =>
    (a.sort_order ?? Infinity) - (b.sort_order ?? Infinity)
    || a.name.localeCompare(b.name, 'es', { numeric: true, sensitivity: 'base' });

// Un módulo es una categoría del Hub y sus lecciones son los tutoriales publicados.
export function buildModules(categories, posts, colors) {
    const rows = new Map((categories || []).map((category) => [category.name, category]));
    (posts || []).forEach((post) => {
        const name = post.category || DEFAULT_MODULE;
        if (!rows.has(name)) rows.set(name, { name });
    });

    return [...rows.values()].sort(byModuleOrder).map(({ name }, index) => ({
        name,
        number: index + 1,
        color: resolveColor(colors, name),
        lessons: (posts || [])
            .filter((post) => (post.category || DEFAULT_MODULE) === name)
            .sort(byDate),
    }));
}

const ALLOWED_VIDEO_HOSTS = ['youtube.com', 'www.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'];

const isAllowedVideo = (src) => {
    try {
        return ALLOWED_VIDEO_HOSTS.includes(new URL(src).hostname);
    } catch {
        return false;
    }
};

// Separa el primer video de YouTube para mostrarlo como reproductor principal de la lección.
export function splitLessonVideo(html) {
    const content = html || '';
    const pattern = /<div[^>]*data-youtube-video[^>]*>\s*<iframe[^>]*\ssrc="([^"]+)"[^>]*>\s*<\/iframe>\s*<\/div>/i;
    const match = content.match(pattern);
    const videoSrc = match ? match[1].replace(/&amp;/g, '&') : null;

    if (!videoSrc || !isAllowedVideo(videoSrc)) {
        return { videoSrc: null, body: content };
    }
    return { videoSrc, body: content.replace(match[0], '') };
}

export function hasVisibleContent(html) {
    if (!html) return false;
    if (/<(img|iframe|video)\b/i.test(html)) return true;
    return html.replace(/<[^>]*>?/gm, '').trim().length > 0;
}
