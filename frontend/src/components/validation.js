export const validationConfig = {
    formSelector: '.popup__form',
    inputSelector: '.popup__input',
    submitButtonSelector: '.popup__button',
    inactiveButtonClass: 'button_inactive',
    inputErrorClass: 'popup__input_type_error',
    errorClass: 'form__input-error_active'
};

const showInputError = (formElement, inputElement, validationConfig) => {
    const errorElement = formElement.querySelector(`.${inputElement.id}-error`);
    inputElement.classList.add(validationConfig.inputErrorClass);

    let errorMessage = inputElement.validationMessage;

    if (inputElement.validity.patternMismatch) {
        errorMessage = inputElement.dataset.errorMessage;
    } else if (inputElement.validity.tooShort || inputElement.validity.tooLong) {
        errorMessage = `Текст должен быть от ${inputElement.minLength} до ${inputElement.maxLength} символов`;
    } else if (inputElement.validity.valueMissing) {
        errorMessage = 'Это обязательное поле';
    }

    if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.classList.add(validationConfig.errorClass);
    }
};

const hideInputError = (formElement, inputElement, validationConfig) => {
    const errorElement = formElement.querySelector(`.${inputElement.id}-error`);
    if (errorElement) {
        inputElement.classList.remove(validationConfig.inputErrorClass);
        errorElement.classList.remove(validationConfig.errorClass);
        errorElement.textContent = '';
    }
};

const checkInputValidity = (formElement, inputElement, validationConfig) => {
    if (inputElement.validity.valid) {
        hideInputError(formElement, inputElement, validationConfig);
    } else {
        showInputError(formElement, inputElement, validationConfig);
    }
};

const hasInvalidInput = (inputList) => {
    return inputList.some((inputElement) => {
        return !inputElement.validity.valid;
    });
};

const toggleButtonState = (inputList, validationConfig, formElement) => {
    const buttonElement = formElement.querySelector(validationConfig.submitButtonSelector);

    if (!buttonElement) return;

    if (hasInvalidInput(inputList)) {``
        buttonElement.classList.add(validationConfig.inactiveButtonClass);
        buttonElement.disabled = true;
    } else {
        buttonElement.classList.remove(validationConfig.inactiveButtonClass);
        buttonElement.disabled = false;
    }
};

const setEventListeners = (formElement, validationConfig) => {
    const inputList = Array.from(
        formElement.querySelectorAll(validationConfig.inputSelector)
    );

    toggleButtonState(inputList, validationConfig, formElement);

    inputList.forEach((inputElement) => {
        inputElement.addEventListener('input', function () {
            checkInputValidity(formElement, inputElement, validationConfig);
            toggleButtonState(inputList, validationConfig, formElement);
        });
    });
};

const enableValidation = (validationConfig) => {
    const formElementList = Array.from(
        document.querySelectorAll(validationConfig.formSelector)
    );

    formElementList.forEach((formElement) => {
        setEventListeners(formElement, validationConfig);
    });
};

function clearValidation(formElement, validationConfig) {
    const inputList = Array.from(
        formElement.querySelectorAll(validationConfig.inputSelector)
    );

    inputList.forEach((inputElement) =>
        hideInputError(formElement, inputElement, validationConfig)
    );
    toggleButtonState(inputList, validationConfig, formElement);
}

export { enableValidation as validation, clearValidation };