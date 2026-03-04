import { Router } from 'express';
import { QuickBooksController } from './quickbook.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';


const router = Router();

// Public routes for OAuth
router.get('/auth', auth(USER_ROLES.ADMIN,USER_ROLES.USER), QuickBooksController.getAuthUrl);
router.get('/callback', QuickBooksController.handleCallback);

// Protected routes
router.get('/connection-status', auth(USER_ROLES.ADMIN, USER_ROLES.USER), QuickBooksController.checkConnection);
router.get('/invoice/:invoiceId', auth(USER_ROLES.ADMIN), QuickBooksController.getInvoice);

export const QuickBooksRoutes = router;