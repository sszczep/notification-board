import axios from 'axios';

const applicationServerKey = urlBase64ToUint8Array('');

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
 
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
 
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function supportsNotifications() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function registerServiceWorker() {
  return await navigator.serviceWorker.register(`${window.location.origin}/serviceWorker.js`);
}

export async function askPermission() {
  return await Notification.requestPermission();
}

export async function getSubscription() {
  if(Notification.permission !== 'granted') return null;

  const registration = await registerServiceWorker();
  const pushSubscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });

  return pushSubscription;
}

export async function getSubscribedChannels(): Promise<string[]> {
  if(!supportsNotifications()) return [];

  const pushSubscription = await getSubscription();
  if(pushSubscription) {
    const { data } = await axios.get('subscriptions/channels', { params: { endpoint: pushSubscription.endpoint } });
    return data;
  } else {
    return [];
  }
}

export async function subscribe(slug: string): Promise<void> {
  const permission = await askPermission();

  if(permission === 'granted') {
    const pushSubscription = await getSubscription();
    await axios.put(`subscriptions/channels/${slug}`, pushSubscription);
  } else {
    throw new Error('You need to allow notifications first!');
  }
}

export async function unsubscribe(slug: string): Promise<void> {
  const pushSubscription = await getSubscription();

  if(pushSubscription) {
    await axios.delete(`subscriptions/channels/${slug}`, { data: { endpoint: pushSubscription.endpoint } });
  } else {
    throw new Error('You need to allow notifications first!');
  }
}