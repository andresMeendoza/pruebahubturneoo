import imageCompression from 'browser-image-compression';

// Tamaños finales. Una foto de varios MB queda en cientos de KB sin pérdida visible.
export const IMAGE_PRESETS = {
    inline: { maxDimension: 1600, maxSizeMB: 0.5 }, // Imágenes dentro de un texto
    cover: { maxDimension: 1920, maxSizeMB: 0.8 }, // Portadas
};

// Algunos sistemas no reconocen estos formatos como imagen, por eso se listan también por extensión.
const EXTRA_EXTENSIONS = ['heic', 'heif', 'tif', 'tiff', 'avif', 'bmp', 'jfif', 'jpe'];
export const IMAGE_ACCEPT = ['image/*', ...EXTRA_EXTENSIONS.map((ext) => `.${ext}`)].join(',');

const MAX_INPUT_MB = 25; // Por encima de esto, procesarla podría colgar el navegador
const MAX_GIF_MB = 5; // Los GIF no se convierten para conservar la animación
const MB = 1024 * 1024;

const OUTPUT_EXTENSIONS = {
    'image/webp': 'webp',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
};

const UNREADABLE = 'No pudimos leer esa imagen. Prueba guardándola como JPG o PNG.';

const extensionOf = (file) => file.name.split('.').pop().toLowerCase();
const hasFormat = (file, types, extensions) => types.includes(file.type) || extensions.includes(extensionOf(file));
const isHeic = (file) => hasFormat(file, ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'], ['heic', 'heif']);
const isTiff = (file) => hasFormat(file, ['image/tiff', 'image/tif'], ['tif', 'tiff']);
const isGif = (file) => hasFormat(file, ['image/gif'], ['gif']);
const baseName = (file) => file.name.replace(/\.[^/.]+$/, '') || 'imagen';

// Los decodificadores se descargan solo cuando alguien sube uno de estos formatos.
async function heicToJpeg(file) {
    const { default: heic2any } = await import('heic2any');
    const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
    const blob = Array.isArray(result) ? result[0] : result;
    return new File([blob], `${baseName(file)}.jpg`, { type: 'image/jpeg' });
}

async function tiffToPng(file) {
    const { default: UTIF } = await import('utif2');
    const buffer = await file.arrayBuffer();
    const [page] = UTIF.decode(buffer);
    UTIF.decodeImage(buffer, page);
    const pixels = UTIF.toRGBA8(page);

    const canvas = document.createElement('canvas');
    canvas.width = page.width;
    canvas.height = page.height;
    const context = canvas.getContext('2d');
    context.putImageData(new ImageData(new Uint8ClampedArray(pixels), page.width, page.height), 0, 0);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    return new File([blob], `${baseName(file)}.png`, { type: 'image/png' });
}

// Valida el archivo y lo deja en un formato que el navegador sabe leer.
export async function normalizeImage(file) {
    const isImage = file.type.startsWith('image/') || EXTRA_EXTENSIONS.includes(extensionOf(file));
    if (!isImage) throw new Error('Ese archivo no es una imagen.');
    if (file.size > MAX_INPUT_MB * MB) throw new Error(`La imagen pesa demasiado. El máximo es ${MAX_INPUT_MB} MB.`);

    try {
        if (isHeic(file)) return await heicToJpeg(file);
        if (isTiff(file)) return await tiffToPng(file);
    } catch {
        throw new Error(UNREADABLE);
    }
    return file;
}

// Reduce una imagen en el navegador, antes de subirla.
// Devuelve { file, extension } o lanza un error con un mensaje para el usuario.
export async function compressImage(file, { maxDimension, maxSizeMB } = IMAGE_PRESETS.inline) {
    const readable = await normalizeImage(file);

    if (isGif(readable)) {
        if (readable.size > MAX_GIF_MB * MB) throw new Error(`Un GIF no puede pesar más de ${MAX_GIF_MB} MB.`);
        return { file: readable, extension: 'gif' };
    }

    let compressed;
    try {
        compressed = await imageCompression(readable, {
            maxSizeMB,
            maxWidthOrHeight: maxDimension,
            fileType: 'image/webp',
            initialQuality: 0.8,
            useWebWorker: false, // Evita cargar un script externo desde un CDN
        });
    } catch {
        throw new Error(UNREADABLE);
    }

    // El almacenamiento solo guarda formatos que se ven en cualquier navegador.
    const extension = OUTPUT_EXTENSIONS[compressed.type];
    if (!extension) throw new Error(UNREADABLE);

    return { file: compressed, extension };
}
