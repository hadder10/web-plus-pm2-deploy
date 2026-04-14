import { Router } from "express";
import { celebrate } from "celebrate";
import {
  createCard,
  getCards,
  deleteCard,
  likeCard,
  dislikeCard,
} from "../controllers/cardController";
import { createCardBody, cardIdParam } from "../validators";

const cardRouter = Router();

cardRouter.get("/", (req, res, next) => getCards(req, res, next));
cardRouter.post("/", celebrate({ body: createCardBody }), (req, res, next) =>
  createCard(req, res, next),
);
cardRouter.delete(
  "/:cardId",
  celebrate({ params: cardIdParam }),
  (req, res, next) => deleteCard(req, res, next),
);
cardRouter.put(
  "/:cardId/likes",
  celebrate({ params: cardIdParam }),
  (req, res, next) => likeCard(req, res, next),
);
cardRouter.delete(
  "/:cardId/likes",
  celebrate({ params: cardIdParam }),
  (req, res, next) => dislikeCard(req, res, next),
);

export default cardRouter;
