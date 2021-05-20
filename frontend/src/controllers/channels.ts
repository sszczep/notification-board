import axios from 'axios';

export function addChannel(name: string, description: string) {
  return axios.put('/channels', { name, description });
};

export function removeChannel(slug: string) {
  return axios.delete(`/channels/${slug}`);
};

export function addNotification(channelSlug: string, name: string, description: string, notify: boolean) {
  return axios.put(`/channels/${channelSlug}`, { name, description, notify });
};

export function removeNotification(channelSlug: string, notificationSlug: string) {
  return axios.delete(`/channels/${channelSlug}/${notificationSlug}`);
};