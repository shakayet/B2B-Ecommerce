import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
const router = express.Router();

router
  .route('/profile')
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.USER), UserController.getUserProfile)
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        req.body = UserValidation.updateUserZodSchema.parse(
          JSON.parse(req.body.data),
        );
      }
      return UserController.updateProfile(req, res, next);
    },
  );

router.get('/', auth(USER_ROLES.ADMIN), UserController.getAllUsers);

router
  .route('/')
  .post(
    validateRequest(UserValidation.createUserZodSchema),
    UserController.createUser,
  );
/**
 * Update user status & customer type
 * PATCH /api/v1/users/:id/status
 */
router.patch(
  '/:userId/status',
  auth(USER_ROLES.ADMIN),
  UserController.updateUserStatusAndCustomerType,
);

// QuickBooks sync
router.post(
  '/:id/sync-quickbooks',
  auth(USER_ROLES.ADMIN),
  UserController.syncWithQuickBooks,
);

// Credit management
router.post(
  '/:userId/credit-limit',
  auth(USER_ROLES.ADMIN),
  UserController.assignCreditLimit,
);
router.get(
  '/:userId/credit-summary',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  UserController.getUserCreditSummary,
);

// Admin role management
router.post('/admin', auth(USER_ROLES.ADMIN), UserController.addAdmin);
router.get('/admin', auth(USER_ROLES.ADMIN), UserController.getAdmins);
router.delete(
  '/admin/:userId',
  auth(USER_ROLES.ADMIN),
  UserController.removeAdmin,
);
router.patch(
  '/admin/:userId',
  auth(USER_ROLES.ADMIN),
  UserController.updateAdmin,
);

export const UserRoutes = router;
