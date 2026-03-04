import { Router } from 'express';
import { CreditController } from './credit.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';


const router = Router();

// Admin only routes
router.post('/assign/:userId', auth(USER_ROLES.ADMIN), CreditController.assignCreditLimit);
router.get('/summary/:userId', auth(USER_ROLES.ADMIN), CreditController.getCreditSummary);
router.get('/transactions/:userId', auth(USER_ROLES.ADMIN), CreditController.getUserCreditTransactions);
router.get('/utilization-report', auth(USER_ROLES.ADMIN), CreditController.getCreditUtilizationReport);

export const CreditRoutes = router;