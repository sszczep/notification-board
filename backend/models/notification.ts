import mongoose from '../database';
import slugify from 'slugify';

export interface Notification {
  slug: string;
  name: string;
  description: string;
  date: Date;
};

export interface NotificationDocument extends Notification, mongoose.Document {};
export interface NotificationModel extends mongoose.Model<NotificationDocument> {};

export const NotificationSchema = new mongoose.Schema<NotificationDocument, NotificationModel>({
  slug: { 
    type: String, 
    unique: true,
    default: function(): string {
      return slugify((this as any).name, { replacement: '-', lower: true });
    },
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
  date: { 
    type: Date, 
    default: function(): Date {
      return new Date();
    },
  },
}, { _id: false });

export default mongoose.model<NotificationDocument, NotificationModel>('Notification', NotificationSchema);