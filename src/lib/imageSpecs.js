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
    maxFileSizeBytes: 2 * 1024 * 1024, // 2 MB
    maxFileSizeLabel: "2 MB",
    aspectRatio: "16:5 (e.g. 1920×600)",
    formats: "JPG, PNG, JPEG, WebP",
  },

  /** Level 2: Category hero (if used). Same as hero. */
  bannerLevel2: {
    width: 1920,
    height: 600,
    minWidth: 800,
    minHeight: 250,
    maxFileSizeBytes: 2 * 1024 * 1024,
    maxFileSizeLabel: "2 MB",
    aspectRatio: "16:5 (e.g. 1920×600)",
    formats: "JPG, PNG, JPEG, WebP",
  },

  /** Level 3: Mid-page scrolling strip. js mart: middle-banner-section — 3:2 cards */
  bannerLevel3: {
    width: 600,
    height: 400,
    minWidth: 360,
    minHeight: 240,
    maxFileSizeBytes: 1 * 1024 * 1024, // 1 MB
    maxFileSizeLabel: "1 MB",
    aspectRatio: "3:2 (e.g. 600×400)",
    formats: "JPG, PNG, JPEG, WebP",
  },

  /** Level 4: Seasonal highlights. Same as Level 3 — 3:2 strip on JS Mart. */
  bannerLevel4: {
    width: 600,
    height: 400,
    minWidth: 360,
    minHeight: 240,
    maxFileSizeBytes: 1 * 1024 * 1024,
    maxFileSizeLabel: "1 MB",
    aspectRatio: "3:2 (e.g. 600×400)",
    formats: "JPG, PNG, JPEG, WebP",
  },

  /** Level 5: Footer promotional strip. js mart: h-[200]–[350px], max-w 1600px → wide short banner */
  bannerLevel5: {
    width: 1920,
    height: 420,
    minWidth: 1200,
    minHeight: 260,
    maxFileSizeBytes: 2 * 1024 * 1024,
    maxFileSizeLabel: "2 MB",
    aspectRatio: "~32:7 (e.g. 1920×420)",
    formats: "JPG, PNG, JPEG, WebP",
  },

  /** Product images (listing & detail) */
  productImages: {
    width: 800,
    height: 800,
    minWidth: 400,
    minHeight: 400,
    maxFileSizeBytes: 1 * 1024 * 1024, // 1 MB
    maxFileSizeLabel: "1 MB",
    aspectRatio: "1:1 (square, e.g. 800×800)",
    formats: "JPG, PNG, JPEG, WebP",
  },

  /** Category icon (featured categories grid). 1:1 */
  categoryImages: {
    width: 400,
    height: 400,
    minWidth: 200,
    minHeight: 200,
    maxFileSizeBytes: 512 * 1024, // 500 KB
    maxFileSizeLabel: "500 KB",
    aspectRatio: "1:1 (e.g. 400×400)",
    formats: "JPG, PNG, JPEG, WebP",
  },

  /** Category banner (homepage category strip & category banner section). js mart: aspect-[3/2], 280–320px wide */
  categoryBanner: {
    width: 600,
    height: 400,
    minWidth: 360,
    minHeight: 240,
    maxFileSizeBytes: 512 * 1024, // 500 KB
    maxFileSizeLabel: "500 KB",
    aspectRatio: "3:2 (e.g. 600×400)",
    formats: "JPG, PNG, JPEG, WebP",
  },

  /** Brand logos */
  brandImages: {
    width: 400,
    height: 200,
    minWidth: 200,
    minHeight: 100,
    maxFileSizeBytes: 512 * 1024, // 500 KB
    maxFileSizeLabel: "500 KB",
    aspectRatio: "2:1 (e.g. 400×200)",
    formats: "JPG, PNG, JPEG, WebP",
  },

  /** Profile / avatar */
  profileAvatar: {
    width: 400,
    height: 400,
    minWidth: 100,
    minHeight: 100,
    maxFileSizeBytes: 512 * 1024, // 500 KB
    maxFileSizeLabel: "500 KB",
    aspectRatio: "1:1 (e.g. 400×400)",
    formats: "JPG, PNG, JPEG, WebP",
  },

  /** Shop logo (settings) */
  logo: {
    width: 400,
    height: 150,
    minWidth: 200,
    minHeight: 80,
    maxFileSizeBytes: 512 * 1024, // 500 KB
    maxFileSizeLabel: "500 KB",
    aspectRatio: "~2.6:1 (e.g. 400×150)",
    formats: "JPG, PNG, JPEG, WebP",
  },

  /** Offer / campaign banner */
  offerBanner: {
    width: 800,
    height: 400,
    minWidth: 400,
    minHeight: 200,
    maxFileSizeBytes: 1 * 1024 * 1024, // 1 MB
    maxFileSizeLabel: "1 MB",
    aspectRatio: "2:1 (e.g. 800×400)",
    formats: "JPG, PNG, JPEG, WebP",
  },

  /** Stock / evidence photo */
  evidencePhoto: {
    width: 1200,
    height: 800,
    maxFileSizeBytes: 2 * 1024 * 1024, // 2 MB
    maxFileSizeLabel: "2 MB",
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
