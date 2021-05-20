import { ErrorRequestHandler } from 'express';
import { HttpError, HttpValidationError } from '../utils/errors';

const handleErrors: ErrorRequestHandler = (err, req, res, next) => {
  if(err instanceof HttpError) {
    return res.status(err.statusCode).send({
      error: {
        name: err.name,
        message: err.message,
      },
    });
  } else if(err instanceof HttpValidationError) {
    const validationErrors = err.validationErrors.map(err => ({ msg: err.msg, param: err.param, value: err.value }));

    return res.status(400).send({
      error: {
        name: err.name,
        message: err.message,
        validationErrors, 
      },
    });
  // Process other errors as internal
  } else {
    res.status(500).send({
      error: {
        name: 'InternalServerError',
        message: 'Internal server error',
      },
    });
  }
};

export default handleErrors;