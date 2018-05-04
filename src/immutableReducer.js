import Immutable from 'immutable';
import {
  GET_SESSION_SUCCESS,
  GET_SESSION_ERROR,
  GET_USER_SESSION_SUCCESS,
  GET_USER_SESSION_ERROR,
  INVALID_SESSION
} from './actionTypes';

export const initialState = Immutable.fromJS({
  authenticated: false,
  checked: false,
  invalid: false,
  user: {}
});

const immutableReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_SESSION_SUCCESS: {
      let newState = state.set('authenticated', true);
      newState = newState.set('invalid', false);
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
    case INVALID_SESSION: {
      let newState = state.set('authenticated', false);
      newState = newState.set('checked', true);
      newState = newState.set('invalid', true);
      newState = newState.set('user', Immutable.Map());
      return newState;
    }
    default: {
      return state;
    }
  }
};

export default immutableReducer;
