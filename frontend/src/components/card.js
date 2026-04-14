import { deleteCardPopup } from "./const.js";
import { deleteCardApi, addLikeCard, deleteLikeCard } from "./api.js";
import { openPopup, closePopup } from "./popup.js";

let selectedCard;
let deleteId;

const openPopupDelete = (cardElement, cardId) => {
    selectedCard = cardElement;
    deleteId = cardId;
    openPopup(deleteCardPopup);
};

const closePopupDelete = () => {
    closePopup(deleteCardPopup);
};

function handleCardDelete(evt) {
    evt.preventDefault();
    deleteCard();
}

const cardTemplate = document.querySelector("#card-template").content;

function createCard(cardData, callbacks, userId) {
    const cardElement = cardTemplate.querySelector(".card").cloneNode(true);
    const cardImage = cardElement.querySelector(".card__image");
    const deleteButton = cardElement.querySelector(".card__delete-button");
    const likeButton = cardElement.querySelector(".card__like-button");
    const likeCountElement = cardElement.querySelector(".card__like-count");

    cardElement.dataset.cardId = cardData._id;
    cardImage.src = cardData.link;
    cardImage.alt = cardData.name;
    cardElement.querySelector(".card__title").textContent = cardData.name;

    if (cardData.owner && cardData.owner._id !== userId) {
        deleteButton.style.display = "none";
    }

    if (cardData.likes && cardData.likes.some((like) => like._id === userId)) {
        likeButton.classList.add("card__like-button_is-active");
    }

    if (likeCountElement) {
        likeCountElement.textContent = cardData.likes ? cardData.likes.length : 0;
    }

    if (callbacks.deleteCard) {
        deleteButton.addEventListener("click", () =>
            callbacks.deleteCard(cardData._id, cardElement)
        );
    }

    if (callbacks.likeCard) {
        likeButton.addEventListener("click", () =>
            callbacks.likeCard(cardData._id, likeButton, likeCountElement)
        );
    }

    if (callbacks.openImagePopup) {
        cardImage.addEventListener("click", callbacks.openImagePopup);
    }

    return cardElement;
}

function deleteCard(cardId, cardElement) {
    if (confirm("Вы уверены, что хотите удалить эту карточку?")) {
        deleteCardApi(cardId)
            .then(() => {
                cardElement.remove();
            })
            .catch((error) => {
                console.error("Ошибка при удалении карточки:", error);
            });
    }
}

function likeCard(cardId, likeButton, likeCountElement) {
    const isLiked = likeButton.classList.contains("card__like-button_is-active");

    const likePromise = isLiked ? deleteLikeCard(cardId) : addLikeCard(cardId);

    likePromise
        .then((updatedCard) => {
            likeButton.classList.toggle("card__like-button_is-active");
            if (likeCountElement) {
                likeCountElement.textContent = updatedCard.likes.length;
            }
        })
        .catch((error) => {
            console.error("Ошибка при изменении лайка:", error);
        });
}

export {
    deleteCard,
    likeCard,
    createCard,
    handleCardDelete,
    openPopupDelete,
};

