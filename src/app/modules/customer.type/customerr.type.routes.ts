import { Router } from 'express';
import { CustomerTypeController } from './customer.type.controller';

const router = Router();

router.post('/', CustomerTypeController.createCustomerType);
router.get('/', CustomerTypeController.getAllCustomerTypes);
router.get('/:id', CustomerTypeController.getSingleCustomerType);
router.patch('/:id', CustomerTypeController.updateCustomerType);
router.delete('/:id', CustomerTypeController.deleteCustomerType);

export const CustomerTypeRoutes = router;
