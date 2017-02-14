import {
  GET_SESSION_SUCCESS,
  GET_SESSION_ERROR,
  GET_USER_SESSION_SUCCESS
} from './actionTypes';

export const initialState = {
  authenticated: false,
  user: {}
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_SESSION_SUCCESS: {
      return { user: { ...state.user }, authenticated: true };
    }
    case GET_SESSION_ERROR: {
      return { user: { ...state.user }, authenticated: false };
    }
    case GET_USER_SESSION_SUCCESS: {
      return { ...state, user: action.user };
    }
    default: {
      return state;
    }
  }
};

export default reducer;
