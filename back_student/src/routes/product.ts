import {Router} from 'express';
import ProductController from '../controller/ProductController';
import {checkJwt} from '../middlewares/checkJwt';
import {checkRole} from '../middlewares/checkRole';

const router = Router();
const auth = [checkJwt];
const admin = [checkJwt, checkRole(['ADMIN'])];

router.get('/', auth, ProductController.listAll);
router.get('/:id([0-9]+)', auth, ProductController.getOneById);
router.post('/', admin, ProductController.create);
router.patch('/:id([0-9]+)', admin, ProductController.edit);
router.delete('/:id([0-9]+)', admin, ProductController.remove);

export default router;
