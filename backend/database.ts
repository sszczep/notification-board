import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import config from './config';

mongoose.connection.on('connected', () => {
  console.info('Mongoose successfully connected to the database');
});

mongoose.connection.on('error', err => {
  throw err;
});

mongoose.connection.on('disconnected', () => {
  throw new Error('Mongoose disconnected! Check if your mongodb is up and running');
});

export async function connect() {
  if(process.env.NODE_ENV === 'test') {
    const mongod = new MongoMemoryServer();
    await mongoose.connect(await mongod.getUri(), { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
  } else {
    await mongoose.connect(config.databaseURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
  }
}

export default mongoose;