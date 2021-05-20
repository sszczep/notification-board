import express from 'express';
import { body } from 'express-validator';

import validate from '../middlewares/validate';

import * as UserController from '../controllers/user';

import { HttpError } from '../utils/errors';

const router = express.Router();

router.post('/sign-in', 
  body('username').isString().withMessage('Username is required'),
  body('password').isString().withMessage('Password is required'),
  validate,
  async (req, res, next) => {
    try {
      const user = await UserController.getUser(req.body.username)

      if(!user || !await user.validatePassword(req.body.password)) {
        throw new HttpError('Invalid credentials', 400);
      }
    
      const token = await user.generateToken();
      res.send(token);
    } catch(err) {
      return next(err);
    }
  },
);

router.post('/sign-up', 
  body('username').isString().withMessage('Username is required'),
  body('password').isString().withMessage('Password is required'),
  validate,
  async (req, res, next) => {
    try {
      const user = await UserController.createUser(req.body.username, req.body.password);
  
      if(!user) {
        throw new HttpError('Could not create user', 400);
      }
  
      const token = await user.generateToken();
      res.send(token);
    } catch(err) {
      return next(err);
    }
  },
);

export default router;