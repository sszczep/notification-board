import { runApp } from '../app';
import { createUser } from '../controllers/user';

import testAuth from './auth.tests';
import testChannels from './channels.tests';
import testSubscriptions from './subscriptions.tests';

before(async() => {
  // Start the server
  await runApp();

  // Add admin user
  await createUser('admin', 'admin', true);
});

// TODO: Tests should be isolated

(async() => {
  testAuth();
  testChannels();
  testSubscriptions();
})();