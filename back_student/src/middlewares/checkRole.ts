import {NextFunction, Request, Response} from 'express';
import {AppDataSource} from '../data-source';
import {User} from '../entity/User';

async function getRole(userId: number): Promise<string | null> {
  try {
    const repo = AppDataSource.getRepository(User);
    const u = await repo.findOneOrFail({ where: { id: userId }, select: ['role'] });
    return u.role;
  } catch {
    return null;
  }
}

export const checkRole = (allowed: string[]) => {
  const allow = new Set(allowed);

  return async (req: Request, res: Response, next: NextFunction) => {
    const payload = res.locals.jwtPayload;
    if (!payload || payload.userId === undefined) {
      res.status(401).send({error: 'unauthenticated'});
      return;
    }

    const role = await getRole(payload.userId);
    if (role === null) {
      res.status(401).send({error: 'user no longer exists'});
      return;
    }

    if (!allow.has(role)) {
      res.status(403).send({error: 'forbidden'});
      return;
    }

    next();
  };
};
