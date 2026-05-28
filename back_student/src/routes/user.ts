import {NextFunction, Request, Response, Router} from 'express';
import UserController from '../controller/UserController';
import {checkJwt} from '../middlewares/checkJwt';
import {checkRole} from '../middlewares/checkRole';

// simple body shape check
function needFields(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const missing = fields.filter(
      f => typeof body[f] !== 'string' || body[f].length === 0,
    );
    if (missing.length > 0) {
      res.status(400).send({error: 'missing fields', missing});
      return;
    }
    next();
  };
}

const router = Router();
const admin = [checkJwt, checkRole(['ADMIN'])];

router.get('/', admin, UserController.listAll);
router.get('/:id([0-9]+)', admin, UserController.getOneById);

router.post('/',
  [...admin, needFields(['username', 'password', 'role'])],
  UserController.newUser);

router.patch('/:id([0-9]+)', admin, UserController.editUser);

router.delete('/:id([0-9]+)', admin, UserController.deleteUser);

export default router;
