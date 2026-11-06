const FALLBACK = '#2563eb';
const INK = '#10182b';
const WHITE = '#ffffff';

const isHex = (value) => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);

const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

const luminance = (hex) => {
    const [r, g, b] = toRgb(hex).map((channel) => {
        const c = channel / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
};

const mixWithInk = (hex, amount) => {
    const ink = toRgb(INK);
    const parts = toRgb(hex).map((channel, i) =>
        Math.round(channel + (ink[i] - channel) * amount).toString(16).padStart(2, '0')
    );
    return `#${parts.join('')}`;
};

// Misma herencia que el panel: color de la categoría, luego el del tipo, luego la marca.
export function resolveColor(colors, category, type = 'help') {
    const list = colors || [];
    const sub = list.find((c) => c.item_type === 'sub' && c.item_name === category)?.color_hex;
    const main = list.find((c) => c.item_type === 'main' && c.item_name === type)?.color_hex;
    return [sub, main].find(isHex) || FALLBACK;
}

// Color de texto legible encima de un fondo con este color.
export function textOn(hex) {
    return contrast(hex, WHITE) >= contrast(hex, INK) ? WHITE : INK;
}

// Oscurece lo justo un color configurado para que se pueda leer como texto sobre blanco.
export function legibleOnWhite(hex) {
    for (let amount = 0; amount <= 1; amount += 0.1) {
        const candidate = mixWithInk(hex, amount);
        if (contrast(candidate, WHITE) >= 4.5) return candidate;
    }
    return INK;
}

// Variables CSS que usan las tarjetas y botones de cada módulo.
export function moduleStyle(hex) {
    return {
        '--mod': hex,
        '--mod-text': legibleOnWhite(hex),
        '--mod-on': textOn(hex),
    };
}
