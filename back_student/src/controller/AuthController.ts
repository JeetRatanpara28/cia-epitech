import {compareSync, hashSync} from 'bcryptjs';
import {validate} from 'class-validator';
import {Request, Response} from 'express';
import * as jwt from 'jsonwebtoken';
import config from '../config/config';
import {AppDataSource} from '../data-source';
import {User} from '../entity/User';

// used so unknown usernames still take the bcrypt cost (login timing)
const dummyHash = hashSync('dummy-not-a-real-password', 12);

function readBody(req: Request): {username?: string; password?: string} {
  const b = (req.body && typeof req.body === 'object') ? req.body : {};
  return {username: b.username, password: b.password};
}

class AuthController {

  public static register = async (req: Request, res: Response) => {
    const {username, password} = readBody(req);
    if (!username || !password) {
      res.status(400).send({error: 'username and password required'});
      return;
    }

    const user = new User();
    user.username = username;
    user.password = password;
    user.role = 'NORMAL';

    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    user.hashPassword();

    const repo = AppDataSource.getRepository(User);
    try {
      await repo.save(user);
    } catch {
      res.status(409).send({error: 'registration failed'});
      return;
    }
    res.status(201).send({status: 'created'});
  };

  public static login = async (req: Request, res: Response) => {
    const {username, password} = readBody(req);
    if (!username || !password) {
      res.status(400).send({error: 'username and password required'});
      return;
    }

    const repo = AppDataSource.getRepository(User);
    let user: User | null = null;
    try {
      user = await repo.findOneOrFail({where: {username}});
    } catch {
      user = null;
    }

    // always run a compare so timing is similar in both branches
    const ok = user
      ? user.checkIfUnencryptedPasswordIsValid(password)
      : (compareSync(password, dummyHash) && false);

    if (!user || !ok) {
      res.status(401).send({error: 'invalid credentials'});
      return;
    }

    const token = jwt.sign(
      {userId: user.id, username: user.username},
      config.jwtSecret,
      {expiresIn: '15m', algorithm: 'HS256'},
    );
    res.send({token});
  };

  public static getMe = async (req: Request, res: Response) => {
    const repo = AppDataSource.getRepository(User);
    try {
      const user = await repo.findOneOrFail({
        select: ['id', 'username', 'role'],
        where: {id: res.locals.jwtPayload.userId},
      });
      res.send({user});
    } catch {
      res.status(404).send({error: 'user not found'});
    }
  };

  public static changePassword = async (req: Request, res: Response) => {
    const id = res.locals.jwtPayload.userId;
    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const {oldPassword, newPassword} = body;
    if (!oldPassword || !newPassword) {
      res.status(400).send({error: 'oldPassword and newPassword required'});
      return;
    }

    const repo = AppDataSource.getRepository(User);
    let user: User;
    try {
      user = await repo.findOneOrFail({ where: { id } });
    } catch {
      res.status(401).send();
      return;
    }

    if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
      res.status(401).send();
      return;
    }

    user.password = newPassword;
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    user.hashPassword();
    await repo.save(user);
    res.status(204).send();
  };
}

export default AuthController;
