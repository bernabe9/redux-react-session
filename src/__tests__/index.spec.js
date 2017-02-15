'use strict';

import { sessionService, sessionReducer } from '../index';
import { initialState } from '../reducer';
import { createStore } from 'redux';
import { __setError, __setSession } from 'localforage';
// import _ from 'lodash';

jest.mock('localforage');

describe('API functions', () => {
  let store;
  // const user = { email: 'test@test.com', firstName: 'test', lastName: 'test' };
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

  // describe('refreshFromLocalStorage', () => {
  //   describe('without any item in the storage', () => {
  //     test('change authenticated flag to false and the user to empty object', (done) => {
  //       // wait for change the redux store
  //       const unsubscribe = store.subscribe(() => {
  //         expect(store.getState().authenticated).toEqual(false);
  //         expect(store.getState().user).toEqual({});
  //         unsubscribe();
  //         done();
  //       });
  //
  //       sessionService.refreshFromLocalStorage();
  //     });
  //   });
  //
  //   describe('with session and user in the storage', () => {
  //     test('change authenticated flag to true and save the user', (done) => {
  //       __setUser(user);
  //       __setSession(session);
  //
  //       // wait for change the redux store
  //       const unsubscribe = store.subscribe(() => {
  //         const state = store.getState();
  //         expect(state.authenticated).toEqual(true);
  //         // wait to change the user
  //         if (!_.isEmpty(state.user)) {
  //           expect(state.user).toMatchObject(user);
  //           unsubscribe();
  //           done();
  //         }
  //       });
  //
  //       sessionService.refreshFromLocalStorage(session);
  //     });
  //   });
  // });

  describe('loadSession', () => {
    describe('localforage returns success', () => {
      test('change authenticated flag to true value', () => {
        __setSession(session);
        return sessionService.loadSession()
        .then((currentSession) => {
          expect(currentSession).toMatchObject(session);
        });
      });
    });

    describe('localforage returns error', () => {
      test('change authenticated flag to true value', () => {
        __setSession(undefined);
        return sessionService.loadSession(session)
        .catch((error) => {
          expect(error).toEqual('Session not found');
        });
      });
    });
  });

  describe('saveSession', () => {
    describe('localforage returns success', () => {
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

    describe('localforage returns error', () => {
      test('change authenticated flag to false value', (done) => {
        __setError(true);
        // wait for change the redux store
        const unsubscribe = store.subscribe(() => {
          expect(store.getState().authenticated).toEqual(false);
          unsubscribe();
          done();
        });

        sessionService.saveSession(session);
      });
    });
  });

});
