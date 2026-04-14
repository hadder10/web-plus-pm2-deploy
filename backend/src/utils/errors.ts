export class CustomError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

export class BadRequestError extends CustomError {
  constructor(message: string = 'Переданы некорректные данные') {
    super(400, message);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string = 'Необходима авторизация') {
    super(401, message);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string = 'Вы можете удалить только свою карточку') {
    super(403, message);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = 'Запрашиваемый ресурс не найден') {
    super(404, message);
  }
}

export class ConflictError extends CustomError {
  constructor(message: string = 'При регистрации указан email, который уже существует на сервере') {
    super(409, message);
  }
}

export class InternalServerError extends CustomError {
  constructor(message: string = 'Ошибка по умолчанию') {
    super(500, message);
  }
}

export class UserNotFoundError extends NotFoundError {
  constructor() {
    super('Запрашиваемый пользователь не найден');
  }
}

export class CardNotFoundError extends NotFoundError {
  constructor() {
    super('Карточка с указанным _id не найдена');
  }
}

export class InvalidUserIdError extends BadRequestError {
  constructor() {
    super('Передан некорректный _id пользователя');
  }
}

export class InvalidCardIdError extends BadRequestError {
  constructor() {
    super('Передан некорректный _id карточки');
  }
}

export class InvalidUserDataError extends BadRequestError {
  constructor() {
    super('Переданы некорректные данные при создании пользователя');
  }
}

export class InvalidProfileDataError extends BadRequestError {
  constructor() {
    super('Переданы некорректные данные при обновлении профиля');
  }
}

export class InvalidAvatarDataError extends BadRequestError {
  constructor() {
    super('Переданы некорректные данные при обновлении аватара');
  }
}

export class InvalidCardDataError extends BadRequestError {
  constructor() {
    super('Переданы некорректные данные при создании карточки');
  }
}

export class EmailPasswordRequiredError extends BadRequestError {
  constructor() {
    super('Email и пароль обязательны для регистрации');
  }
}

export class EmailPasswordLoginRequiredError extends BadRequestError {
  constructor() {
    super('Email и пароль обязательны для входа');
  }
}

export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super('Неправильные почта или пароль');
  }
}

export class CardNotFoundSimpleError extends NotFoundError {
  constructor() {
    super('Карточка не найдена');
  }
}
