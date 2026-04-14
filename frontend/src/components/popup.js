import { popupsArray } from "./const.js";

function handleEscClick(evt) {
    if (evt.key === "Escape") {
        const openedPopup = popupsArray.find((popup) =>
            popup.classList.contains("popup_is-opened")
        );
        if (openedPopup) {
            closePopup(openedPopup);
        }
    }
}

function handleOverlayClick(evt) {
    if (evt.target === evt.currentTarget) {
        closePopup(evt.target);
    }
}

function handleCloseButtonClick(evt) {
    const button = evt.target;
    const popup = button.closest(".popup");
    closePopup(popup);
}

function openPopup(popup) {
    popup.classList.add("popup_is-opened");
    document.addEventListener("keydown", handleEscClick);
}

function closePopup(popup) {
    if (popup) {
        popup.classList.remove("popup_is-opened");
        document.removeEventListener("keydown", handleEscClick);
    }
}

function closePopupEvent(evt) {
    const openedPopup = evt.target.closest(".popup");
    closePopup(openedPopup);
}

popupsArray.forEach((popup) => {
    popup.addEventListener("click", handleOverlayClick);
});

export {
    handleOverlayClick,
    closePopup,
    openPopup,
    handleCloseButtonClick,
    closePopupEvent,
};


