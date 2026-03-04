// src/modules/banner/banner.service.ts

import { IBanner } from "./banar.interface";
import Banner from "./banar.model";


/**
 * Create or update banners
 */
export const createAndUpdateBannerService = async (payload: IBanner) => {
  let banner = await Banner.findOne();

  if (!banner) {
    // Initialize fixed-size slots
    banner = await Banner.create({
      webBanners: Array(6).fill({ image: '' }),
      mobileBanners: Array(4).fill({ image: '' }),
    });
  }

  // Make sure arrays exist
  banner.webBanners = banner.webBanners ?? Array(6).fill({ image: '' });
  banner.mobileBanners = banner.mobileBanners ?? Array(4).fill({ image: '' });

  // Fill web banners in first empty slots (image === '')
  if (payload.webBanners && payload.webBanners.length) {
    for (let i = 0; i < banner.webBanners.length && payload.webBanners.length; i++) {
      if (!banner.webBanners[i].image) {
        banner.webBanners[i] = payload.webBanners.shift()!;
      }
    }
  }

  // Fill mobile banners in first empty slots
  if (payload.mobileBanners && payload.mobileBanners.length) {
    for (let i = 0; i < banner.mobileBanners.length && payload.mobileBanners.length; i++) {
      if (!banner.mobileBanners[i].image) {
        banner.mobileBanners[i] = payload.mobileBanners.shift()!;
      }
    }
  }

  await banner.save();
  return banner;
};




/**
 * Get current banners
 */
export const getBannerService = async () => {
  return Banner.findOne();
};

/**
 * Delete a specific banner image by type and index
 */
export const deleteBannerImageByIdService = async (
  type: 'web' | 'mobile',
  bannerId: string
): Promise<IBanner | null> => {
  const banner = await Banner.findOne();
  if (!banner) return null;

  // Ensure arrays exist
  banner.webBanners = banner.webBanners ?? Array(6).fill({ image: '' });
  banner.mobileBanners = banner.mobileBanners ?? Array(4).fill({ image: '' });

  if (type === 'web') {
    const index = banner.webBanners.findIndex(b => b._id?.toString() === bannerId);
    if (index === -1) return null; // ID not found

    // Delete image but keep slot
    banner.webBanners[index].image = '';
  } else {
    const index = banner.mobileBanners.findIndex(b => b._id?.toString() === bannerId);
    if (index === -1) return null; // ID not found

    // Delete image but keep slot
    banner.mobileBanners[index].image = '';
  }

  await banner.save();
  return banner;
};







