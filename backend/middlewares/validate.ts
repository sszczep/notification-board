import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { HttpValidationError } from '../utils/errors';

const validate: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return next(new HttpValidationError('Invalid values', errors.array()));
  }

  return next();
};

export default validate;