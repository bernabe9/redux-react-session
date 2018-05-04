import {
  GET_SESSION_SUCCESS,
  GET_SESSION_ERROR,
  GET_USER_SESSION_SUCCESS,
  GET_USER_SESSION_ERROR,
  INVALID_SESSION
} from './actionTypes';

export const initialState = {
  authenticated: false,
  checked: false,
  invalid: false,
  user: {}
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_SESSION_SUCCESS: {
      return {
        user: { ...state.user },
        authenticated: true,
        checked: true,
        invalid: false
      };
    }
    case GET_SESSION_ERROR: {
      return {
        ...state,
        user: { ...state.user },
        authenticated: false,
        checked: true
      };
    }
    case GET_USER_SESSION_SUCCESS: {
      return { ...state, user: action.user };
    }
    case GET_USER_SESSION_ERROR: {
      return { ...state, user: {} };
    }
    case INVALID_SESSION: {
      return {
        user: {},
        checked: true,
        authenticated: false,
        invalid: true
      };
    }
    default: {
      return state;
    }
  }
};

export default reducer;
