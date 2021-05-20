import authRouter from './routes/auth';
import channelsRouter from './routes/channels';
import config from './config';
import cors from 'cors';
import express, { Express } from 'express';
import handleErrors from './middlewares/errorHandler';
import helmet from 'helmet';
import { connect as mongooseConnect } from './database';
import subscriptionsRouter from './routes/subscriptions';
import webpush from 'web-push';

// Promisify express.listen
const expressListen = (app: Express, port: number) => new Promise((resolve, reject) => {
  app.listen(port)
    .once('listening', resolve)
    .once('error', reject);
});

// Setup webpush
webpush.setVapidDetails('mailto:root@localhost', config.webpushPublic, config.webpushPrivate);

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use('/channels', channelsRouter);
app.use('/subscriptions', subscriptionsRouter);
app.use('/auth', authRouter);

app.use(handleErrors);

export async function runApp() {
  await mongooseConnect();
  await expressListen(app, 3001);
  console.info(`Server is running on http://localhost:3001`);

  return app;
}

export default app;