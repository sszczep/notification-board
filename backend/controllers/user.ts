import UserModel from '../models/user';

export async function getUser(username: string) {
  return UserModel.findOne({ 
    username: { $regex: new RegExp(`^${username}$`), $options: 'i' },
  }).exec();
}

export async function createUser(username: string, password: string, isAdmin?: boolean) {
  return UserModel.create({
    username,
    password,
    isAdmin,
  });
}