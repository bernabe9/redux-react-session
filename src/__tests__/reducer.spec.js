import reducer, { initialState } from '../reducer';
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
      expect(reducer(initialState, action).authenticated).toEqual(true);
    });

    test('change checked to true value', () => {
      expect(reducer(initialState, action).checked).toEqual(true);
    });

    test('not change the user object', () => {
      expect(reducer(initialState, action).user).toEqual(initialState.user);
    });
  });

  describe('GET_SESSION_ERROR', () => {
    const action = { type: GET_SESSION_ERROR };

    test('change authenticated to false value', () => {
      expect(reducer(initialState, action).authenticated).toEqual(false);
    });

    test('change checked to true value', () => {
      expect(reducer(initialState, action).checked).toEqual(true);
    });

    test('not change the user object', () => {
      expect(reducer(initialState, action).user).toEqual(initialState.user);
    });
  });

  describe('GET_USER_SESSION_SUCCESS', () => {
    const user = { email: 'test@test.com', firstName: 'test', lastName: 'test' };
    const action = { user, type: GET_USER_SESSION_SUCCESS };

    test('save the new user', () => {
      expect(reducer(initialState, action).user).toEqual(user);
    });

    test('not change the authenticated flag', () => {
      expect(reducer(initialState, action).authenticated).toEqual(initialState.authenticated);
    });
  });

  describe('GET_USER_SESSION_ERROR', () => {
    const user = { email: 'test@test.com', firstName: 'test', lastName: 'test' };
    const modificatedState = { user, authenticated: true };
    const action = { type: GET_USER_SESSION_ERROR };

    test('remove the saved user', () => {
      expect(reducer(modificatedState, action).user).toEqual({});
    });

    test('not change the authenticated flag', () => {
      expect(reducer(modificatedState, action).authenticated).toEqual(modificatedState.authenticated);
    });
  });

  describe('INVALID_SESSION', () => {
    const action = { type: INVALID_SESSION };

    test('change authenticated to false value', () => {
      expect(reducer(initialState, action).authenticated).toEqual(false);
    });

    test('change checked to true value', () => {
      expect(reducer(initialState, action).checked).toEqual(true);
    });

    test('change invalid session to true', () => {
      expect(reducer(initialState, action).invalid).toEqual(true);
    });

    test('not change the user object', () => {
      expect(reducer(initialState, action).user).toEqual(initialState.user);
    });
  });
});
