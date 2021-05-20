// TODO: Move to env
export default {
  databaseURI: 'mongodb://localhost:27017/notification-board',
  jwtSecret: 'my-secret-key',
  tokenExp: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60), // Expiration date set to 90 days
  webpushPublic: '',
  webpushPrivate: ''
};