import { HttpError } from '../utils/errors';
import { body } from 'express-validator';
import express from 'express';
import isAdmin from '../middlewares/isAdmin';
import validate from '../middlewares/validate';
import * as ChannelController from '../controllers/channel';
import * as NotificationController from '../controllers/notification';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const channels = await ChannelController.getChannelsSummary();
  
    res.send(channels);
  } catch(err) {
    return next(err);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const channel = await ChannelController.getChannel(req.params.slug);

    if(!channel) {
      throw new HttpError('Specified channel does not exist', 404);
    }

    channel.notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.send(channel);
  } catch(err) {
    return next(err);
  }
});

// Below routes are admin operations
router.use(isAdmin);

router.put('/',
  body('name').isString().withMessage('Channel name is required'),
  body('description').isString().withMessage('Channel description is required'),
  validate,
  async (req, res, next) => {
    try {
      await ChannelController.createChannel(req.body.name, req.body.description);

      res.sendStatus(200);
    } catch(err) {
      return next(err);
    }
  },
);

router.delete('/:slug', async (req, res, next) => {
  try {
    await ChannelController.deleteChannel(req.params.slug);

    res.sendStatus(200);
  } catch(err) {
    return next(err);
  }
});

router.put('/:slug', 
  body('name').isString().withMessage('Notification name'),
  body('description').isString().withMessage('Notification description is required'),
  body('notify').isBoolean().withMessage('Notification notify is required'),
  validate,
  async (req, res, next) => {    
    try {
      await ChannelController.addNotification(req.params.slug, req.body.name, req.body.description);

      if(req.body.notify) {
        await NotificationController.notifyChannelSubscribers(req.params.slug, req.body.name, req.body.description, `/channel/${req.params.slug}`);
      }

      res.sendStatus(200);
    } catch(err) {
      return next(err);
    }
  },
);

router.delete('/:channelSlug/:notificationSlug', async (req, res, next) => {
  try {
    await ChannelController.deleteNotification(req.params.channelSlug, req.params.notificationSlug);

    res.sendStatus(200);
  } catch(err) {
    return next(err);
  }
});

export default router;