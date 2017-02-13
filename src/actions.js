// actionTypes
const GET_SESSION_SUCCESS = 'GET_SESSION_SUCCESS';
const GET_SESSION_ERROR = 'GET_SESSION_ERROR';
const GET_USER_SESSION_SUCCESS = 'GET_USER_SESSION_SUCCESS';

export const getSessionSuccess = () => {
  return { type: GET_SESSION_SUCCESS };
};

export const getSessionError = () => {
  return { type: GET_SESSION_ERROR };
};

export const getUserSessionSuccess = (user) => {
  return {
    user,
    type: GET_USER_SESSION_SUCCESS
  };
};
