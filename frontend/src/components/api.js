const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const apiRoutes = {
  user: "users/me",
  cards: "cards",
  likes: "likes",
};

const headers = {
  "Content-Type": "application/json",
};

const checkData = (response) => {
  if (response.ok) {
    return response.json();
  }
  return Promise.reject(`Ошибка: ${response.status}`);
};

function request(endpoint, options) {
  return fetch(`${BASE_URL}/${endpoint}`, options).then(checkData);
}

const getCards = () => {
  return request(apiRoutes.cards, {
    method: "GET",
    headers,
  });
};

const postCard = (name, link) => {
  return request(apiRoutes.cards, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name,
      link,
    }),
  });
};

const deleteCardApi = (id) => {
  return request(`${apiRoutes.cards}/${id}`, {
    method: "DELETE",
    headers,
  });
};

const getUser = () => {
  return request(apiRoutes.user, {
    method: "GET",
    headers,
  });
};

const patchUser = (name, about) => {
  return request(apiRoutes.user, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      name,
      about,
    }),
  });
};

const addLikeCard = (id) => {
  return request(`${apiRoutes.cards}/${id}/${apiRoutes.likes}`, {
    method: "PUT",
    headers,
  });
};

const deleteLikeCard = (id) => {
  return request(`${apiRoutes.cards}/${id}/${apiRoutes.likes}`, {
    method: "DELETE",
    headers,
  });
};

const patchAvatar = (avatar) => {
  return request(`${apiRoutes.user}/avatar`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ avatar }),
  });
};

export {
  getCards,
  postCard,
  deleteCardApi,
  getUser,
  patchUser,
  addLikeCard,
  deleteLikeCard,
  patchAvatar,
};
