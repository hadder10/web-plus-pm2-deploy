import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  getUsers, getUserById, getCurrentUser, updateProfile, updateAvatar,
} from '../controllers/userController';
import { updateProfileBody, updateAvatarBody, userIdParam } from '../validators';

const userRouter = Router();
userRouter.get('/', (req, res, next) => getUsers(req, res, next));
userRouter.get('/me', (req, res, next) => getCurrentUser(req, res, next));
userRouter.get('/:userId', celebrate({ params: userIdParam }), (req, res, next) => getUserById(req, res, next));
userRouter.patch('/me', celebrate({ body: updateProfileBody }), (req, res, next) => updateProfile(req, res, next));
userRouter.patch('/me/avatar', celebrate({ body: updateAvatarBody }), (req, res, next) => updateAvatar(req, res, next));

export default userRouter;
