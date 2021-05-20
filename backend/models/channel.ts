import mongoose from '../database';
import slugify from 'slugify';

import { Notification, NotificationDocument, NotificationSchema } from './notification';
import { Subscription, SubscriptionDocument, SubscriptionSchema } from './subscription';

import { HttpError } from '../utils/errors';

export interface Channel {
  slug: string;
  name: string;
  description: string;
  notifications: Notification[];
  subscriptions: Subscription[];
};

export interface ChannelDocument extends Channel, mongoose.Document {
  notifications: mongoose.Types.Array<NotificationDocument>;
  subscriptions: mongoose.Types.Array<SubscriptionDocument>;
};
export interface ChannelModel extends mongoose.Model<ChannelDocument> {};

export const ChannelSchema = new mongoose.Schema<ChannelDocument, ChannelModel>({
  slug: { 
    type: String, 
    unique: true, 
    default: function(): string {
      return slugify((this as any).name, { replacement: '-', lower: true });
    },
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
  notifications: [NotificationSchema],
  subscriptions: [SubscriptionSchema],
});

// TODO: fix typing
ChannelSchema.post('save', function(err: any, doc: any, next: any) {
  if(err.name === 'MongoError' && err.code === 11000) {
    return next(new HttpError('Channel with given name already exists', 409));
  } else return next(err);
});

export default mongoose.model<ChannelDocument, ChannelModel>('Channel', ChannelSchema);