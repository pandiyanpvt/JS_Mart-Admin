/** Shown when a product has no uploaded image (file: public/images/image_emty.png) */
export const PRODUCT_IMAGE_PLACEHOLDER = '/images/image_emty.png';

function normalizeImagePath(s) {
    if (s.startsWith('data:') || s.startsWith('http') || s.startsWith('//')) return s;
    if (s.startsWith('/')) return s;
    return `/${s}`;
}

export function resolveProductImageUrl(src) {
    if (src == null) return PRODUCT_IMAGE_PLACEHOLDER;
    const s = String(src).trim();
    if (s === '') return PRODUCT_IMAGE_PLACEHOLDER;
    return normalizeImagePath(s);
}

/** True if the catalog row actually has an image URL (not missing / blank). */
export function hasProductImage(src) {
    if (src == null) return false;
    return String(src).trim() !== '';
}

export function productImageUnoptimized(src) {
    return typeof src === 'string' && (src.startsWith('data:') || /^https?:/i.test(src));
}
