import sanitize from 'sanitize-html';

// Todo el HTML guardado por usuarios o editores pasa por aquí antes de mostrarse.
// Solo se permite lo que producen los editores del Hub; lo demás se elimina.
const SIZE = [/^\d+(?:\.\d+)?(?:px|%|em|rem)?$/, /^auto$/];

const OPTIONS = {
    allowedTags: [
        'p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's', 'code', 'pre', 'blockquote',
        'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'a', 'img', 'div', 'span', 'iframe',
    ],
    allowedAttributes: {
        a: ['href', 'target', 'rel'],
        img: ['src', 'alt', 'title', 'width', 'height', 'style'],
        iframe: ['src', 'width', 'height', 'title', 'allowfullscreen'],
        div: ['data-youtube-video', 'style'],
        span: ['style'],
        p: ['style'],
    },
    allowedStyles: {
        '*': {
            width: SIZE,
            height: SIZE,
            'max-width': SIZE,
            display: [/^(?:block|inline|inline-block)$/],
            'text-align': [/^(?:left|right|center|justify)$/],
            margin: [/^[\d\s.a-z%-]+$/],
        },
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: { img: ['https', 'http'] },
    allowProtocolRelative: false,
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'youtube-nocookie.com'],
    allowIframeRelativeUrls: false,
    transformTags: {
        a: sanitize.simpleTransform('a', { rel: 'noopener noreferrer nofollow' }),
    },
};

export function sanitizeHtml(html) {
    return sanitize(html || '', OPTIONS);
}
