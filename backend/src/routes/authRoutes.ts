import { Router } from 'express';
import { celebrate } from 'celebrate';
import { login, createUser } from '../controllers/userController';
import { signUpBody, signInBody } from '../validators';

const authRouter = Router();

authRouter.post('/signup', celebrate({ body: signUpBody }), (req, res, next) => createUser(req, res, next));
authRouter.post('/signin', celebrate({ body: signInBody }), (req, res, next) => login(req, res, next));

export default authRouter;
