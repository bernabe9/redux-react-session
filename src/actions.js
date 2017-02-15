import {
  GET_SESSION_SUCCESS,
  GET_SESSION_ERROR,
  GET_USER_SESSION_SUCCESS,
  GET_USER_SESSION_ERROR
} from './actionTypes';

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

export const getUserSessionError = () => {
  return { type: GET_USER_SESSION_ERROR };
};
