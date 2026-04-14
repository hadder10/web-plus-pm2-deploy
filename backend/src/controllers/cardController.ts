import { Request, Response, NextFunction } from "express";
import Card from "../models/card";
import { AuthRequest } from "../middlewares/auth";
import { NotFoundError, ForbiddenError } from "../middlewares/errorHandler";

export const createCard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, link } = req.body;
    const authReq = req as AuthRequest;
    const cardData: any = { name, link };
    if (authReq.user && authReq.user._id) {
      cardData.owner = authReq.user._id;
    }
    const card = await Card.create(cardData);
    res.status(201).send(card);
  } catch (err) {
    next(err);
  }
};

export const getCards = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cards = await Card.find({});
    res.send(cards);
  } catch (err) {
    next(err);
  }
};

export const deleteCard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { cardId } = req.params;
    const authReq = req as AuthRequest;
    const card = await Card.findById(cardId);

    if (!card) {
      throw new NotFoundError("Карточка с указанным _id не найдена");
    }
    await Card.findByIdAndDelete(cardId);
    res.send({ message: "Карточка удалена" });
  } catch (err) {
    next(err);
  }
};

export const likeCard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as AuthRequest;
    const userId =
      authReq.user && authReq.user._id ? authReq.user._id : undefined;
    const mongoose = require("mongoose");
    const anonId = mongoose.Types.ObjectId();
    const idToUse = userId || anonId;
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: idToUse } },
      { new: true },
    );

    if (!card) {
      throw new NotFoundError("Карточка не найдена");
    }

    res.send(card);
  } catch (err) {
    next(err);
  }
};

export const dislikeCard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as AuthRequest;
    const userId =
      authReq.user && authReq.user._id ? authReq.user._id : undefined;
    const mongoose = require("mongoose");
    // If no authenticated user, remove last like element
    if (!userId) {
      const cardDoc: any = await Card.findById(req.params.cardId);
      if (!cardDoc) throw new NotFoundError("Карточка не найдена");
      if (cardDoc.likes && cardDoc.likes.length > 0) {
        cardDoc.likes.pop();
        await cardDoc.save();
        return res.send(cardDoc);
      }
      const emptyCard = await Card.findById(req.params.cardId);
      res.send(emptyCard);
      return;
    }
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: userId } },
      { new: true },
    );

    if (!card) {
      throw new NotFoundError("Карточка не найдена");
    }

    res.send(card);
  } catch (err) {
    next(err);
  }
};
