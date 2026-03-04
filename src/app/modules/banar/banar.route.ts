// src/modules/banner/banner.route.ts
import { Router } from 'express';
import {
  createAndUpdateBannerController,
  getBannerController,
  deleteBannerImageByIndexController,
} from './banar.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';


const router = Router();

// Upload 6 web + 4 mobile banners
router.post(
  '/',
  fileUploadHandler(),
  createAndUpdateBannerController
);

// Get banners
router.get('/', getBannerController);

// Delete specific banner image by type/index
router.delete('/:type/:banarId', deleteBannerImageByIndexController);

export const BannerRouter = router;
