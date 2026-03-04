import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { SocialLinkController } from './socialLink.controller';
const router = express.Router();
// social management
router.post(
  '/',
  //   auth(USER_ROLES.ADMIN),
  SocialLinkController.createSocialLinks,
);
router.get(
  '/',
  //  auth(USER_ROLES.ADMIN),
  SocialLinkController.getSocialLinks,
);

export const SocialLinkRoutes = router;
