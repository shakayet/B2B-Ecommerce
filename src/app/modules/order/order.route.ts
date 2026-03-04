import { Router } from 'express';
import { OrderController } from './order.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';


const router = Router();

// User routes
router.post('/', auth(USER_ROLES.USER), OrderController.createOrder);
router.get('/my-orders', auth(USER_ROLES.USER), OrderController.getMyOrders);
router.get('/my-orders/:orderId', auth(USER_ROLES.USER), OrderController.getOrderById);
router.post('/:orderId/cancel', auth(USER_ROLES.USER), OrderController.cancelOrder);

// Admin routes
router.get('/admin/all', auth(USER_ROLES.ADMIN), OrderController.getAllOrders);
router.get('/admin/stats', auth(USER_ROLES.ADMIN), OrderController.getOrderStats);
router.get('/admin/daily-product-orders', auth(USER_ROLES.ADMIN), OrderController.getDailyAllProductOrders);
router.get('/admin/my-orders/:userId', auth(USER_ROLES.ADMIN), OrderController.getMyOrdersForAdmin);
router.get('/admin/:orderId', auth(USER_ROLES.ADMIN), OrderController.getOrderById);
router.patch('/admin/:orderId/status', auth(USER_ROLES.ADMIN), OrderController.updateOrderStatus);

export const OrderRoutes = router;