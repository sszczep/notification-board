import mongoose from '../database';

export interface Subscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export interface SubscriptionDocument extends Subscription, mongoose.Document {};
export interface SubscriptionModel extends mongoose.Model<SubscriptionDocument> {};

export const SubscriptionSchema = new mongoose.Schema<SubscriptionDocument, SubscriptionModel>({
  endpoint: { type: String, required: true, unique: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },
}, { _id: false });

export default mongoose.model<SubscriptionDocument, SubscriptionModel>('Subscription', SubscriptionSchema);