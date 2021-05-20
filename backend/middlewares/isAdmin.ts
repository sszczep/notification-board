import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { JWTPayload } from '../models/user';
import { HttpError } from '../utils/errors';

const isAdmin: RequestHandler = async (req, res, next) => {
  const auth = req.header('Authorization');
  if(!auth) return next(new HttpError('No auth token specified', 401));

  const [_, token] = auth.split(' ');

  let decodedToken: JWTPayload;
  try {
    decodedToken = jwt.verify(token, config.jwtSecret) as JWTPayload;
    if(!decodedToken) throw new Error();
  } catch(err) {
    return next(new HttpError('Specified auth token is not valid', 401));
  }

  if(!decodedToken.isAdmin) return next(new HttpError('No permission', 403));
  return next();
};

export default isAdmin;