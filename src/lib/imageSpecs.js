/**
 * Image upload specs for JS Mart Admin & Storefront.
 * Use these dimensions and file size limits for consistent display across Admin and js mart.
 * Homepage banner sizes match js mart: hero-section, middle-banner-section, footer-banner-section.
 */

export const IMAGE_SPECS = {
  /** Level 1: Hero / Header carousel (homepage top). js mart: aspect-[16/5], max-h 600px */
  banners: {
    width: 1920,
    height: 600,
    minWidth: 800,
    minHeight: 250,
    maxFileSizeBytes: 10 * 1024 * 1024, // 10 MB
    maxFileSizeLabel: "10 MB",
    aspectRatio: "16:5 (e.g. 1920×600)",
    formats: "JPG, PNG, JPEG, WebP",
  },

  /** Level 2: Category hero strip (full-width short banner above category section). */
  bannerLevel2: {
    width: 1920,
    height: 300,
    minWidth: 1200,
    minHeight: 180,
    maxFileSizeBytes: 10 * 1024 * 1024,
    maxFileSizeLabel: "10 MB",
    aspectRatio: "32:5 (e.g. 1920×300)",
    formats: "JPG, PNG, JPEG, WebP",
  },

  /** Level 3: Curated picks cards (row of short cards above category section). */
  bannerLevel3: {
    width: 900,
    height: 375,
    minWidth: 600,
    minHeight: 160,
    maxFileSizeBytes: 10 * 1024 * 1024,
    maxFileSizeLabel: "10 MB",
    aspectRatio: "12:5 (e.g. 900×375)",
    formats: "JPG, PNG, JPEG, WebP",
  },

  /** Level 4: Seasonal highlights. Matches homepage wide strip (same style as Level 5). */
  bannerLevel4: {
    width: 1920,
    height: 300,
    minWidth: 1200,
    minHeight: 180,
    maxFileSizeBytes: 10 * 1024 * 1024,
    maxFileSizeLabel: "10 MB",
    aspectRatio: "32:5 (e.g. 1920×300)",
    formats: "JPG, PNG, JPEG, WebP",
  },

  /** Level 5: Footer promotional strip. Same dimensions as Level 4 for consistent home style. */
  bannerLevel5: {
    width: 1920,
    height: 300,
    minWidth: 1200,
    minHeight: 180,
    maxFileSizeBytes: 10 * 1024 * 1024,
    maxFileSizeLabel: "10 MB",
    aspectRatio: "32:5 (e.g. 1920×300)",
    formats: "JPG, PNG, JPEG, WebP",
  },

  /** Product images (listing & detail) */
  productImages: {
    width: 800,
    height: 800,
    minWidth: 400,
    minHeight: 400,
    maxFileSizeBytes: 10 * 1024 * 1024, // 10 MB (matches backend / Cloudinary limit)
    maxFileSizeLabel: "10 MB",
    aspectRatio: "1:1 (square, e.g. 800×800)",
    formats: "JPG, PNG, JPEG, WebP",
  },

  /** Category icon (featured categories grid). 1:1 */
  categoryImages: {
    width: 400,
    height: 400,
    minWidth: 200,
    minHeight: 200,
    maxFileSizeBytes: 10 * 1024 * 1024,
    maxFileSizeLabel: "10 MB",
    aspectRatio: "1:1 (e.g. 400×400)",
    formats: "JPG, PNG, JPEG, WebP",
  },

  /** Category banner (shop page header when category selected). Match home header hero size. */
  categoryBanner: {
    width: 1920,
    height: 600,
    minWidth: 800,
    minHeight: 250,
    maxFileSizeBytes: 10 * 1024 * 1024,
    maxFileSizeLabel: "10 MB",
    aspectRatio: "16:5 (e.g. 1920×600)",
    formats: "JPG, PNG, JPEG, WebP",
  },

  /** Brand logos */
  brandImages: {
    width: 400,
    height: 200,
    minWidth: 200,
    minHeight: 100,
    maxFileSizeBytes: 10 * 1024 * 1024,
    maxFileSizeLabel: "10 MB",
    aspectRatio: "2:1 (e.g. 400×200)",
    formats: "JPG, PNG, JPEG, WebP",
  },

  /** Profile / avatar */
  profileAvatar: {
    width: 400,
    height: 400,
    minWidth: 100,
    minHeight: 100,
    maxFileSizeBytes: 10 * 1024 * 1024, // 10 MB
    maxFileSizeLabel: "10 MB",
    aspectRatio: "1:1 (e.g. 400×400)",
    formats: "JPG, PNG, JPEG, WebP",
  },

  /** Shop logo (settings) */
  logo: {
    width: 400,
    height: 150,
    minWidth: 200,
    minHeight: 80,
    maxFileSizeBytes: 10 * 1024 * 1024,
    maxFileSizeLabel: "10 MB",
    aspectRatio: "~2.6:1 (e.g. 400×150)",
    formats: "JPG, PNG, JPEG, WebP",
  },

  /** Offer / campaign banner */
  offerBanner: {
    width: 800,
    height: 400,
    minWidth: 400,
    minHeight: 200,
    maxFileSizeBytes: 10 * 1024 * 1024,
    maxFileSizeLabel: "10 MB",
    aspectRatio: "2:1 (e.g. 800×400)",
    formats: "JPG, PNG, JPEG, WebP",
  },

  /** Stock / evidence photo */
  evidencePhoto: {
    width: 1200,
    height: 800,
    maxFileSizeBytes: 10 * 1024 * 1024, // 10 MB
    maxFileSizeLabel: "10 MB",
    formats: "JPG, PNG, JPEG, WebP",
  },
};

/** Promotion level → image spec key for homepage banners */
export const BANNER_SPEC_BY_LEVEL = {
  1: "banners",
  2: "bannerLevel2",
  3: "bannerLevel3",
  4: "bannerLevel4",
  5: "bannerLevel5",
};

/**
 * Get recommended banner spec for a promotion level (1–5).
 * @param {number} level - Promotion level 1–5
 * @returns {object} Spec with width, height, aspectRatio, maxFileSizeLabel, formats
 */
export function getBannerSpecForLevel(level) {
  const key = BANNER_SPEC_BY_LEVEL[Number(level)] || "banners";
  return IMAGE_SPECS[key] || IMAGE_SPECS.banners;
}

/**
 * Validate file size against spec.
 * @param {File} file
 * @param {string} specKey - One of: banners, bannerLevel2–5, productImages, categoryImages, categoryBanner, brandImages, profileAvatar, logo, offerBanner, evidencePhoto
 * @returns {{ valid: boolean; message?: string }}
 */
export function validateImageFileSize(file, specKey) {
  const spec = IMAGE_SPECS[specKey];
  if (!spec || !spec.maxFileSizeBytes) return { valid: true };
  if (file.size > spec.maxFileSizeBytes) {
    return {
      valid: false,
      message: `File size must be under ${spec.maxFileSizeLabel}. Current: ${(file.size / 1024).toFixed(0)} KB`,
    };
  }
  return { valid: true };
}

/**
 * Validate image dimensions (optional; use after loading image in browser).
 * @param {number} width
 * @param {number} height
 * @param {string} specKey - One of: banners, productImages, categoryImages, brandImages, profileAvatar, logo, offerBanner, evidencePhoto
 * @returns {{ valid: boolean; message?: string }}
 */
export function validateImageDimensions(width, height, specKey) {
  const spec = IMAGE_SPECS[specKey];
  if (!spec || !spec.minWidth) return { valid: true };
  if (width < spec.minWidth || height < spec.minHeight) {
    return {
      valid: false,
      message: `Recommended min size: ${spec.minWidth}×${spec.minHeight} px. Use ${spec.aspectRatio} for best display.`,
    };
  }
  return { valid: true };
}

/**
 * Fixed aspect for crop UI (matches IMAGE_SPECS layout hints). Omit for free-form crop.
 * @param {string} specKey
 * @returns {number | undefined}
 */
export function getCropAspectForSpec(specKey) {
  const map = {
    banners: 16 / 5,
    bannerLevel2: 32 / 5,
    bannerLevel3: 12 / 5,
    bannerLevel4: 32 / 5,
    bannerLevel5: 32 / 5,
    productImages: 1,
    categoryImages: 1,
    categoryBanner: 16 / 5,
    brandImages: 2,
    profileAvatar: 1,
    logo: 400 / 150,
    offerBanner: 2,
    supplierLogo: 2,
  };
  const v = map[specKey];
  return typeof v === 'number' ? v : undefined;
}

