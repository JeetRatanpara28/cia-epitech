import {Router} from 'express';
import OrderController from '../controller/OrderController';
import {checkJwt} from '../middlewares/checkJwt';
import {checkRole} from '../middlewares/checkRole';

const router = Router();
const auth = [checkJwt];
const admin = [checkJwt, checkRole(['ADMIN'])];

router.get('/', admin, OrderController.listAll);
router.post('/', auth, OrderController.create);

export default router;
