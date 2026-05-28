import {NextFunction, Request, Response} from 'express';
import * as jwt from 'jsonwebtoken';
import config from '../config/config';

// pull the token out of "Authorization: Bearer xxx"
function getToken(req: Request): string | null {
  const h = req.headers.authorization;
  if (typeof h !== 'string') return null;
  const [scheme, value] = h.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !value) return null;
  return value.trim();
}

// only re-issue a token when the current one is close to expiring
const REFRESH_THRESHOLD = 5 * 60; // seconds

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  const token = getToken(req);
  if (!token) {
    res.status(401).send({error: 'missing bearer token'});
    return;
  }

  let payload: any;
  try {
    payload = jwt.verify(token, config.jwtSecret, {algorithms: ['HS256']});
  } catch {
    res.status(401).send({error: 'invalid token'});
    return;
  }

  res.locals.jwtPayload = payload;

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === 'number' && payload.exp - now < REFRESH_THRESHOLD) {
    const fresh = jwt.sign(
      {userId: payload.userId, username: payload.username},
      config.jwtSecret,
      {expiresIn: '15m', algorithm: 'HS256'},
    );
    res.setHeader('X-Refresh-Token', fresh);
  }

  next();
};
