import express from 'express';
import { query, body } from 'express-validator';

import validate from '../middlewares/validate';

import * as ChannelController from '../controllers/channel';

const router = express.Router();

router.get('/channels', 
  query('endpoint').isURL().withMessage('endpoint is not valid URL'),
  validate,
  async (req, res, next) => {
    try {
      const channels = await ChannelController.getSubscriberChannels(req.query.endpoint as string);
      res.send(channels);
    } catch(err) {
      return next(err);
    }
  },
);

router.put('/channels/:slug', 
  body('endpoint').isURL().withMessage('endpoint is not valid URL'),
  body('keys.p256dh').isString().withMessage('keys.p256dh is required'),
  body('keys.auth').isString().withMessage('keys.auth is required'),
  validate,
  async (req, res, next) => {
    try {
      await ChannelController.addSubscription(
        req.params.slug, 
        {
          endpoint: req.body.endpoint,
          keys: {
            p256dh: req.body.keys.p256dh,
            auth: req.body.keys.auth,
          },
        },
      );
  
      res.sendStatus(200);
    } catch(err) {
      return next(err);
    }
  },
);

router.delete('/channels/:slug', 
  body('endpoint').isURL().withMessage('endpoint is not valid URL'),
  validate,
  async (req, res, next) => {
    try {
      await ChannelController.deleteSubscription(req.params.slug, req.body.endpoint);
  
      res.sendStatus(200);
    } catch(err) {
      return next(err);
    }
  },
);

export default router;