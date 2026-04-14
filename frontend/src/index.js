import "./pages/index.css";

import {
    getCards,
    postCard,
    patchAvatar,
    deleteCardApi,
    getUser,
    patchUser,
    addLikeCard,
    deleteLikeCard,
} from "./components/api.js";

import { createCard, deleteCard, likeCard } from "./components/card.js";

import { renderLoading, handleSubmit } from "./components/utils.js";

import {
    buttonTypeCard,
    avatarFormElement,
    avatarForm,
    nameInput,
    jobInput,
    userJobElement,
    userNameElement,
    newPlaceFormElement,
    newPlaceNameInput,
    newLinkInput,
    newCardForm,
    placesList,
    deleteCardPopup,
    deleteCardForm,
    editFormElement,
    popupImage,
    popupImageCaption,
    editForm,
    profileEditButton,
    profileAddButton,
    avatarImage,
    popupsArray
} from "./components/const.js";

import { openPopup, closePopup, closePopupEvent } from "./components/popup.js";

import { validation, clearValidation, validationConfig } from "./components/validation.js";

import avatarUrl from "./images/avatar.jpg";



const closePopupButtons = document.querySelectorAll(".popup__close");

let currentUserId = null;
let selectedCard;
let id;

if (avatarImage) {
    avatarImage.addEventListener("click", () => {
        openPopup(avatarForm);
        clearValidation(avatarFormElement, validationConfig);
    });
} else {
    console.error("Avatar image element not found");
}

function addCards(array) {
    array.forEach(function (cardContent) {
        const newCard = createCard(
            cardContent,
            deleteCard,
            likeCard,
            openImagePopup,
            currentUserId
        );
        placesList.append(newCard);
    });
}

function openImagePopup(event) {
    openPopup(buttonTypeCard);
    const card = event.target.closest(".card");
    popupImage.src = card.querySelector(".card__image").src;
    popupImage.alt = card.querySelector(".card__title").textContent;
    popupImageCaption.textContent = card.querySelector(".card__title").textContent;
}

const openPopupDelete = (cardElement, cardId) => {
    selectedCard = cardElement;
    id = cardId;
    deleteCardPopup.dataset.cardId = cardId;
    cardElement.dataset.cardId = cardId;

    openPopup(deleteCardPopup);
};

const callbacksObject = {
    deleteCard: (cardId, cardElement) => openPopupDelete(cardElement, cardId),
    likeCard: likeCard,
    openImagePopup: openImagePopup,
};

function initialLoading() {
    Promise.all([getUser(), getCards()])
        .then(([userData, cards]) => {
            currentUserId = userData._id;
            userNameElement.textContent = userData.name;
            userJobElement.textContent = userData.about;
            if (userData.avatar) {
                avatarImage.style.backgroundImage = `url(${userData.avatar})`;
            }

            cards.forEach((cardContent) => {
                const newCard = createCard(cardContent, callbacksObject, currentUserId);
                placesList.append(newCard);
            });
        })
        .catch((err) => {
            console.error('Ошибка при загрузке данных:', err);
        });
}

initialLoading();

closePopupButtons.forEach((button) => {
    button.addEventListener("click", closePopupEvent);
});

if (profileEditButton) {
    profileEditButton.addEventListener("click", () => {
        nameInput.value = userNameElement.textContent;
        jobInput.value = userJobElement.textContent;
        openPopup(editForm);
        if (editFormElement) {
            clearValidation(editFormElement, validationConfig);
        }
    });
}

if (profileAddButton) {
    profileAddButton.addEventListener("click", () => {
        openPopup(newCardForm);
        if (newPlaceFormElement) {
            clearValidation(newPlaceFormElement, validationConfig);
        }
    });
}

function handleProfileFormSubmit(evt) {
    evt.preventDefault();

    const currentName = nameInput.value;
    const currentJob = jobInput.value;

    const submitButton = evt.target.querySelector(".popup__button");
    const originalText = submitButton.textContent;
    submitButton.textContent = "Сохранение...";
    submitButton.disabled = true;

    patchUser(currentName, currentJob)
        .then((userData) => {
            userNameElement.textContent = userData.name;
            userJobElement.textContent = userData.about;
            closePopup(editForm);
        })
        .catch((error) => {
            console.error("Ошибка при обновлении профиля:", error);
        })
        .finally(() => {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        });
}

editForm.addEventListener("submit", handleProfileFormSubmit);

if (newPlaceFormElement) {
    newPlaceFormElement.addEventListener("submit", (evt) => {
        handleNewCardFormSubmit(evt, callbacksObject, currentUserId);
    });
}

validation(validationConfig);

const profileImageElement = document.querySelector(".profile__image");
if (profileImageElement && avatarUrl) {
    profileImageElement.style.backgroundImage = `url(${avatarUrl})`;
}

function handleAvatarFormSubmit(event) {
    function makeRequest() {
        const avatar = avatarFormElement.elements["avatar-input"].value;
        return patchAvatar(avatar).then((res) => {
            avatarImage.style.backgroundImage = `url('${res.avatar}')`;
            closePopup(avatarForm);
        });
    }
    handleSubmit(makeRequest, event);
}

if (avatarFormElement) {
    avatarFormElement.addEventListener("submit", handleAvatarFormSubmit);
} else {
    console.error("Avatar form element not found");
}

function setInitialEditProfileFormValues() {
    nameInput.value = userNameElement.textContent;
    jobInput.value = userJobElement.textContent;
}

function handleFormSubmit(evt) {
    function makeRequest() {
        const name = nameInput.value;
        const about = jobInput.value;
        return patchUser(name, about).then((dataUser) => {
            userNameElement.textContent = dataUser.name;
            userJobElement.textContent = dataUser.about;
            setInitialEditProfileFormValues();
            closePopup(evt.target.closest(".popup_is-opened"));
        });
    }
    handleSubmit(makeRequest, evt);
}

function handleNewCardFormSubmit(event, callbacksObject, userId) {
    function makeRequest() {
        return postCard(newPlaceNameInput.value, newLinkInput.value).then(
            (card) => {
                const newCardElement = createCard(card, callbacksObject, userId);
                placesList.prepend(newCardElement);
                closePopup(newCardForm);
            }
        );
    }

    handleSubmit(makeRequest, event);
}

function handleDeleteSubmit(evt) {
    evt.preventDefault();
    const submitButton = evt.submitter;
    const initialText = submitButton.textContent;
    submitButton.textContent = 'Удаление...';

    if (!selectedCard || !id) {
        console.error('Данные карточки не найдены');
        return;
    }

    deleteCardApi(id)
        .then(() => {
            selectedCard.remove();
            closePopup(deleteCardPopup);
        })
        .catch((err) => {
            console.error('Ошибка при удалении карточки:', err);
        })
        .finally(() => {
            submitButton.textContent = initialText;
            selectedCard = null;
            id = null;
        });
}

deleteCardForm.addEventListener('submit', handleDeleteSubmit);








