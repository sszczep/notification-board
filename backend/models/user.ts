import mongoose from '../database';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../config';

import { HttpError } from '../utils/errors';

export interface User {
  username: string;
  password: string;
  isAdmin: boolean;
};

export interface JWTPayload {
  username: string;
  isAdmin: boolean;
};

export interface UserDocument extends User, mongoose.Document {
  validatePassword(password: string): Promise<boolean>;
  generateToken(): Promise<string>;
};
export interface UserModel extends mongoose.Model<UserDocument> {};

export const UserSchema = new mongoose.Schema<UserDocument, UserModel>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
});

UserSchema.pre('save', async function() {
  if(this.isModified('password') || this.isNew) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

// TODO: fix typing
UserSchema.post('save', function(err: any, doc: any, next: any) {
  if(err.name === 'MongoError' && err.code === 11000) {
    return next(new HttpError('User with given username already exists', 409));
  } else return next(err);
});

UserSchema.methods.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateToken = async function() {
  return jwt.sign({
    exp: config.tokenExp,
    username: this.username,
    isAdmin: this.isAdmin,
  }, config.jwtSecret);
};

export default mongoose.model<UserDocument, UserModel>('User', UserSchema);