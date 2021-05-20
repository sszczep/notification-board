import './index.css';

import { registerServiceWorker, supportsNotifications } from './controllers/notifications';

import App from './App';
import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3001';

if(supportsNotifications()) {
  registerServiceWorker();
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);