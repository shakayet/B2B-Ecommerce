import { Router } from 'express';
import { FeatureProductController } from './feature.controller';

const router = Router();

router.post('/',  FeatureProductController.toggleFeatureProduct);
router.get('/', FeatureProductController.getMyFeatureProducts);

export const FeatureProductRoutes = router;