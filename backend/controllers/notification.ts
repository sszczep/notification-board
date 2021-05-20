import webpush from 'web-push';

import ChannelModel from '../models/channel';

export async function notifyChannelSubscribers(slug: string, title: string, body: string, url: string) {
  const channel = await ChannelModel.findOne({ slug }, { subscriptions: 1 }).exec();
  if(channel) {
    channel.subscriptions.forEach(subscription => {
      webpush.sendNotification(subscription, JSON.stringify({ title, body, url }));
    });
  }
}