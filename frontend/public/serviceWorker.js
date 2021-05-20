self.addEventListener('push', function(event) {
  const { title, body, url } = event.data.json();
  event.waitUntil(self.registration.showNotification(title, { body, data: { url } }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(clients.openWindow(event.notification.data.url));
});