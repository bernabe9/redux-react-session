import { fromJS } from 'immutable';
import reducer, { initialState } from '../immutableReducer';
import {
  GET_SESSION_SUCCESS,
  GET_SESSION_ERROR,
  GET_USER_SESSION_SUCCESS,
  GET_USER_SESSION_ERROR,
  INVALID_SESSION
} from '../actionTypes';

describe('Reducer', () => {
  test('set initial state by default', () => {
    const action = { type: 'unknown' };
    const expected = initialState;

    expect(reducer(undefined, action)).toEqual(expected);
  });

  describe('GET_SESSION_SUCCESS', () => {
    const action = { type: GET_SESSION_SUCCESS };

    test('change authenticated to true value', () => {
      const authenticated = reducer(initialState, action).get('authenticated');
      expect(authenticated).toEqual(true);
    });

    test('change checked to true value', () => {
      const checked = reducer(initialState, action).get('checked');
      expect(checked).toEqual(true);
    });

    test('not change the user object', () => {
      const user = reducer(initialState, action).get('user');
      expect(user).toEqual(initialState.get('user'));
    });
  });

  describe('GET_SESSION_ERROR', () => {
    const action = { type: GET_SESSION_ERROR };

    test('change authenticated to false value', () => {
      const authenticated = reducer(initialState, action).get('authenticated');
      expect(authenticated).toEqual(false);
    });

    test('change checked to true value', () => {
      const checked = reducer(initialState, action).get('checked');
      expect(checked).toEqual(true);
    });

    test('not change the user object', () => {
      const user = reducer(initialState, action).get('user');
      expect(user).toEqual(initialState.get('user'));
    });
  });

  describe('GET_USER_SESSION_SUCCESS', () => {
    const newUser = { email: 'test@test.com', firstName: 'test', lastName: 'test' };
    const action = { user: newUser, type: GET_USER_SESSION_SUCCESS };

    test('save the new user', () => {
      const user = reducer(initialState, action).get('user').toJS();
      expect(user).toEqual(newUser);
    });

    test('not change the authenticated flag', () => {
      const authenticated = reducer(initialState, action).get('authenticated');
      expect(authenticated).toEqual(initialState.get('authenticated'));
    });
  });

  describe('GET_USER_SESSION_ERROR', () => {
    const user = { email: 'test@test.com', firstName: 'test', lastName: 'test' };
    const modificatedState = fromJS({ user, authenticated: true });
    const action = { type: GET_USER_SESSION_ERROR };

    test('remove the saved user', () => {
      const user = reducer(modificatedState, action).get('user').toJS();
      expect(user).toEqual({});
    });

    test('not change the authenticated flag', () => {
      const authenticated = reducer(modificatedState, action).get('authenticated');
      expect(authenticated).toEqual(modificatedState.get('authenticated'));
    });
  });

  describe('INVALID_SESSION', () => {
    const action = { type: INVALID_SESSION };

    test('change authenticated to false value', () => {
      const authenticated = reducer(initialState, action).get('authenticated');
      expect(authenticated).toEqual(false);
    });

    test('change checked to true value', () => {
      const checked = reducer(initialState, action).get('checked');
      expect(checked).toEqual(true);
    });

    test('change invalid session to true', () => {
      const invalid = reducer(initialState, action).get('invalid');
      expect(invalid).toEqual(true);
    });

    test('not change the user object', () => {
      const user = reducer(initialState, action).get('user').toJS();
      expect(user).toEqual(initialState.get('user').toJS());
    });
  });
});
