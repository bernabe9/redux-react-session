'use strict';

import { sessionService, sessionReducer } from '../index';
import { initialState } from '../reducer';
import { createStore } from 'redux';
import { __setError, __setSession, __setUser } from 'localforage';
import * as Cookies from "js-cookie";

jest.mock('localforage');

describe('API functions', () => {
  let store;
  const user = { email: 'test@test.com', firstName: 'test', lastName: 'test' };
  const session = { token: '12341234' };
  beforeAll((done) => {
    store = createStore(sessionReducer, initialState);

    // wait for refresh redux store from localStorage
    const unsubscribe = store.subscribe(() => {
      unsubscribe();
      done();
    });
    sessionService.initSessionService(store);
  });

  describe('refreshFromLocalStorage', () => {
    describe('without any item in the storage', () => {
      test('change authenticated flag to false and the user to empty object', (done) => {
        // wait for change the redux store
        const unsubscribe = store.subscribe(() => {
          expect(store.getState().authenticated).toEqual(false);
          expect(store.getState().user).toEqual({});
          unsubscribe();
          done();
        });

        sessionService.refreshFromLocalStorage();
      });
    });

    describe('with session and user in the storage', () => {
      test('change authenticated flag to true and save the user', (done) => {
        __setUser(user);
        __setSession(session);

        // wait for change the redux store
        const unsubscribe = store.subscribe(() => {
          const state = store.getState();
          expect(state.authenticated).toEqual(true);
          // wait to change the user
          const { user } = state;
          if (!(Object.keys(user).length === 0 && user.constructor === Object)) {
            expect(state.user).toMatchObject(user);
            unsubscribe();
            done();
          }
        });

        sessionService.refreshFromLocalStorage(session);
      });
    });
  });

  describe('checkAuth', () => {
    let nextState;
    let replace;
    let next;
    beforeEach(() => {
      nextState = { location: { pathname: 'test' } };
      replace = jest.fn();
      next = jest.fn();
    });

    describe('with logged user', () => {
      beforeEach(() => {
        __setUser(user);
        __setSession(session);
      });

      test('does call next function', (done) => {
        const next = jest.fn(() => {
          expect(next).toHaveBeenCalled();
          done();
        });
        sessionService.checkAuth(nextState, replace, next);
      });

      describe('with option refreshOnCheckAuth enable', () => {
        test('change authenticated flag to true and save the user', (done) => {
          sessionService.setOptions(store, { refreshOnCheckAuth: true });
          // wait for change the redux store
          const unsubscribe = store.subscribe(() => {
            const state = store.getState();
            expect(state.authenticated).toEqual(true);
            // wait to change the user
            const { user } = state;
            if (!(Object.keys(user).length === 0 && user.constructor === Object)) {
              expect(state.user).toMatchObject(user);
              unsubscribe();
              done();
            }
          });

          sessionService.checkAuth(nextState, replace, next);
        });
      });
    });

    describe('without logged user', () => {
      beforeEach(() => {
        __setUser(undefined);
        __setSession(undefined);
        sessionService.setOptions(store, { refreshOnCheckAuth: false, redirectPath: 'redirectionPath' });
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

      describe('with option refreshOnCheckAuth enable', () => {
        test('change authenticated flag to false and the user to empty object', (done) => {
          sessionService.setOptions(store, { refreshOnCheckAuth: true });
          // wait for change the redux store
          const unsubscribe = store.subscribe(() => {
            const state = store.getState();
            expect(state.authenticated).toEqual(false);
            // wait to empty the user
            const { user } = state;
            if ((Object.keys(user).length === 0 && user.constructor === Object)) {
              expect(state.user).toEqual({});
              unsubscribe();
              done();
            }
          });

          sessionService.checkAuth(nextState, replace, next);
        });
      });
    });
  });

  describe('saveSession', () => {
    describe('with localforage', () => {
      describe('localforage returns success', () => {
        test('change authenticated flag to true value', (done) => {
          __setError(false);
          // wait for change the redux store
          const unsubscribe = store.subscribe(() => {
            expect(store.getState().authenticated).toEqual(true);
            unsubscribe();
            done();
          });

          sessionService.saveSession(session);
        });
      });

      describe('localforage returns error', () => {
        beforeEach(() => {
          __setError(true);
        });

        test('call the cookies service to save the data', () => {
          Cookies.set = jest.fn(() => {
            expect(Cookies.set).toHaveBeenCalled();
          });
          sessionService.saveSession(session);
        });
      });
    });

    describe('with cookies', () => {
      beforeEach(() => {
        sessionService.setOptions(store, { driver: 'COOKIES' });
      });

      afterEach(() => {
        sessionService.setOptions(store);
      });

      test('change authenticated flag to true value', (done) => {
        // wait for change the redux store
        const unsubscribe = store.subscribe(() => {
          expect(store.getState().authenticated).toEqual(true);
          unsubscribe();
          done();
        });

        sessionService.saveSession(session);
      });
    });
  });

  describe('loadSession', () => {
    describe('with localforage', () => {
      describe('localforage returns success', () => {
        test('return the correct value of the session stored', () => {
          __setSession(session);
          return sessionService.loadSession()
          .then((currentSession) => {
            expect(currentSession).toMatchObject(session);
          });
        });
      });

      describe('localforage returns error', () => {
        test('return an error', () => {
          __setSession(undefined);
          return sessionService.loadSession()
          .catch((error) => {
            expect(error).toEqual('Session not found');
          });
        });
      });
    });

    describe('with cookies', () => {
      beforeEach(() => {
        sessionService.setOptions(store, { driver: 'COOKIES' });
      });

      afterEach(() => {
        sessionService.setOptions(store);
      });

      test('return the correct value of the session stored', () => {
        return sessionService.loadSession()
        .then((currentSession) => {
          expect(currentSession).toMatchObject(session);
        });
      });
    });
  });

  describe('deleteSession', () => {
    test('change authenticated flag to false value', (done) => {
      // wait for change the redux store
      const unsubscribe = store.subscribe(() => {
        expect(store.getState().authenticated).toEqual(false);
        unsubscribe();
        done();
      });

      sessionService.deleteSession();
    });
  });

  describe('saveUser', () => {
    describe('with localforage', () => {
      describe('localforage returns success', () => {
        test('change user in store to the user data', (done) => {
          __setError(false);
          // wait for change the redux store
          const unsubscribe = store.subscribe(() => {
            expect(store.getState().user).toMatchObject(user);
            unsubscribe();
            done();
          });

          sessionService.saveUser(user);
        });
      });

      describe('localforage returns error', () => {
        test('change user in store to an empty object', (done) => {
          __setError(true);
          // wait for change the redux store
          const unsubscribe = store.subscribe(() => {
            expect(store.getState().user).toMatchObject({});
            unsubscribe();
            done();
          });

          sessionService.saveUser(user);
        });
      });
    });

    describe('with cookies', () => {
      beforeEach(() => {
        sessionService.setOptions(store, { driver: 'COOKIES' });
      });

      afterEach(() => {
        sessionService.setOptions(store);
      });

      test('change user in store to the user data', (done) => {
        // wait for change the redux store
        const unsubscribe = store.subscribe(() => {
          expect(store.getState().user).toMatchObject(user);
          unsubscribe();
          done();
        });

        sessionService.saveUser(user);
      });
    });
  });

  describe('loadUser', () => {
    describe('with localforage', () => {
      describe('localforage returns success', () => {
        test('return the correct value of the user stored', () => {
          __setUser(user);
          return sessionService.loadUser()
          .then((currentUser) => {
            expect(currentUser).toMatchObject(user);
          });
        });
      });

      describe('localforage returns error', () => {
        test('return an error', () => {
          __setUser(undefined);
          return sessionService.loadUser()
          .catch((error) => {
            expect(error).toEqual('User not found');
          });
        });
      });
    });

    describe('with cookies', () => {
      beforeEach(() => {
        sessionService.setOptions(store, { driver: 'COOKIES' });
      });

      afterEach(() => {
        sessionService.setOptions(store);
      });

      test('return the correct value of the user stored', () => {
        return sessionService.loadUser()
        .then((currentUser) => {
          expect(currentUser).toMatchObject(user);
        });
      });
    });
  });

  describe('deleteUser', () => {
    test('change user in store to an empty object', (done) => {
      // wait for change the redux store
      const unsubscribe = store.subscribe(() => {
        expect(store.getState().user).toEqual({});
        unsubscribe();
        done();
      });

      sessionService.deleteUser();
    });
  });
});
