export function formatDate(value, options = { year: 'numeric', month: 'long', day: 'numeric' }) {
    const date = value ? new Date(value) : new Date();
    // Zona fija: el servidor y el navegador deben mostrar la misma fecha.
    return date.toLocaleDateString('es-ES', { timeZone: 'UTC', ...options });
}

export function stripHtml(html) {
    if (!html) return '';
    return html
        .replace(/<[^>]*>?/gm, ' ') // Con espacio, para que no se peguen palabras de bloques distintos
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
