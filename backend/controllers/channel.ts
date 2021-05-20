import ChannelModel from '../models/channel';

export async function getChannelsSummary() {
  return ChannelModel.aggregate([
    { $project: { 
      slug: 1,
      name: 1, 
      description: 1, 
      notificationsCount: { $size: '$notifications' },
      subscriptionsCount: { $size: '$subscriptions' },
    }},
  ]).exec();
}

export async function getChannel(slug: string) {
  return ChannelModel.findOne(
    { slug }, 
    'slug name description notifications',
  ).exec();
}

export async function createChannel(name: string, description: string) {
  return ChannelModel.create({
    name, 
    description,
  });
}

export async function deleteChannel(slug: string) {
  return ChannelModel.deleteOne({ slug }).exec()
}

export async function addNotification(slug: string, name: string, description: string) {
  return ChannelModel.updateOne(
    { slug },
    { $addToSet: { notifications: { name, description } as any } },
  ).exec();
}

export async function deleteNotification(channelSlug: string, notificationSlug: string) {
  ChannelModel.updateOne(
    { slug: channelSlug },
    { $pull: { notifications: { slug: notificationSlug } } },
  ).exec()
}

export async function getSubscriberChannels(endpoint: string) {
  const channels = await ChannelModel.find(
    { 'subscriptions.endpoint': endpoint }, 
    'slug'
  ).exec();
  
  if(!channels) {
    return [];
  }

  return channels.map(channel => channel.slug);
}

export async function addSubscription(slug: string, subscription: { endpoint: string, keys: { p256dh: string, auth: string } }) {
  return ChannelModel.updateOne(
    { slug },
    { $addToSet: { subscriptions: subscription as any } },
  );
}

export async function deleteSubscription(slug: string, endpoint: string) {
  ChannelModel.updateOne(
    { slug },
    { $pull: { subscriptions: { endpoint } } },
  ).exec();
}