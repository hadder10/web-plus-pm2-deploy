import { Joi } from 'celebrate';

const mongoId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

export const signUpBody = Joi.object().keys({
  name: Joi.string().min(2).max(30),
  about: Joi.string().min(2).max(200),
  avatar: Joi.string().pattern(/^https?:\/\/(www\.)?[a-zA-Z\d\-._~:?#[\]@!$&'()*+,;=]{1,}\.[a-z]{1,6}([a-zA-Z\d\-._~:?#[\]@!$&'()*+,;=/]*)#?$/),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

export const signInBody = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updateProfileBody = Joi.object().keys({
  name: Joi.string().min(2).max(30).required(),
  about: Joi.string().min(2).max(200).required(),
});

export const updateAvatarBody = Joi.object().keys({
  avatar: Joi.string().pattern(/^https?:\/\/(www\.)?[a-zA-Z\d\-._~:?#[\]@!$&'()*+,;=]{1,}\.[a-z]{1,6}([a-zA-Z\d\-._~:?#[\]@!$&'()*+,;=/]*)#?$/).required(),
});

export const createCardBody = Joi.object().keys({
  name: Joi.string().min(2).max(30).required(),
  link: Joi.string().pattern(/^https?:\/\/(www\.)?[a-zA-Z\d\-._~:?#[\]@!$&'()*+,;=]{1,}\.[a-z]{1,6}([a-zA-Z\d\-._~:?#[\]@!$&'()*+,;=/]*)#?$/).required(),
});

export const userIdParam = Joi.object().keys({
  userId: mongoId.required(),
});

export const cardIdParam = Joi.object().keys({
  cardId: mongoId.required(),
});
