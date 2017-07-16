import Immutable from 'immutable';
import {
  GET_SESSION_SUCCESS,
  GET_SESSION_ERROR,
  GET_USER_SESSION_SUCCESS,
  GET_USER_SESSION_ERROR
} from './actionTypes';

export const initialState = Immutable.fromJS({
  authenticated: false,
  checked: false,
  user: {}
});

const immutableReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_SESSION_SUCCESS: {
      const newState = state.set('authenticated', true);
      return newState.set('checked', true);
    }
    case GET_SESSION_ERROR: {
      const newState = state.set('authenticated', false);
      return newState.set('checked', true);
    }
    case GET_USER_SESSION_SUCCESS: {
      return state.set('user', Immutable.fromJS(action.user));
    }
    case GET_USER_SESSION_ERROR: {
      return state.set('user', Immutable.Map());
    }
    default: {
      return state;
    }
  }
};

export default immutableReducer;
