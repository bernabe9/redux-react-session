'use strict';

import { sessionService, sessionReducer } from '../index';
import { initialState } from '../reducer';
import { createStore } from 'redux';
// import { __setError, __setSession, __setUser } from 'localforage';
// import * as Cookies from "js-cookie";

jest.mock('localforage');

describe('API functions', () => {
  let store;
  let user;

  describe('server', () => {
    describe('with session and user in the request', () => {
      beforeEach(() => {
        store = createStore(sessionReducer, initialState);
        user = { email: 'test@test.com', firstName: 'test', lastName: 'test' };
        const cookies = 'USER-SESSION={%22token%22:%2212345%22}; USER_DATA={%22email%22:%22test@test.com%22%2C%22firstName%22:%22test%22%2C%22lastName%22:%22test%22}';
        const req = { get: jest.fn(() => cookies) };
        sessionService.initServerSession(store, req, { redirectPath: 'redirectionPath' });
      });

      describe('saveFromClient', () => {
        test('change authenticated flag to true', (done) => {
          // wait for change the redux store
          const unsubscribe = store.subscribe(() => {
            const state = store.getState();
            expect(state.authenticated).toEqual(true);
            unsubscribe();
            done();
          });
        });

        test('save the user', (done) => {
          // wait for change the redux store
          const unsubscribe = store.subscribe(() => {
            const state = store.getState();
            // wait to change the user
            if (!(Object.keys(state.user).length === 0 && state.user.constructor === Object)) {
              expect(state.user).toMatchObject(user);
              unsubscribe();
              done();
            }
          });
        });
      });

      describe('checkAuth', () => {
        let nextState;
        let replace;
        beforeEach(() => {
          nextState = { location: { pathname: 'test' } };
          replace = jest.fn();
        });

        test('does call next function', (done) => {
          const next = jest.fn(() => {
            expect(next).toHaveBeenCalled();
            done();
          });
          sessionService.checkAuth(nextState, replace, next);
        });
      });
    });

    describe('without any item in the request', () => {
      beforeEach(() => {
        store = createStore(sessionReducer, initialState);
        const cookies = undefined;
        const req = { get: jest.fn(() => cookies) };
        sessionService.initServerSession(store, req, { redirectPath: 'redirectionPath' });
      });

      describe('checkAuth', () => {
        let nextState;
        let next;
        beforeEach(() => {
          nextState = { location: { pathname: 'test' } };
          next = jest.fn();
        });

        test('does call replace function', (done) => {
          const replace = jest.fn(() => {
            expect(replace).toHaveBeenCalled();
            done();
          });
          sessionService.checkAuth(nextState, replace, next);
        });

        test('does redirect to the redirectPath', (done) => {
          const expectedArg = {
            pathname: 'redirectionPath',
            state: { nextPathname: nextState.location.pathname }
          };
          const replace = jest.fn(() => {
            expect(replace).toHaveBeenCalledWith(expectedArg);
            done();
          });
          sessionService.checkAuth(nextState, replace, next);
        });
      });
    });
  });
});
