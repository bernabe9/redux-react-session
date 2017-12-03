'use strict';

import { USER_SESSION, USER_DATA } from '../src/constants';

const localforage = jest.genMockFromModule('localforage');

function createInstance() {
  return new LocalForage();
}

let throwError = false;
let user = undefined;
let session = undefined;

class LocalForage {
  constructor() {}

  setItem(item, data) {
    return new Promise((resolve, reject) => {
      if (item === USER_SESSION) {
        session = data;
      } else if (item === USER_DATA) {
        user = data;
      }
      throwError ? reject() : resolve(data);
    });
  }

  getItem(item) {
    return new Promise((resolve) => {
      if (item === USER_SESSION) {
        return resolve(session);
      } else if (item === USER_DATA) {
        return resolve(user);
      }
    });
  }

  removeItem(item) {
    return new Promise((resolve) => {
      if (item === USER_SESSION) {
        session = undefined;
      } else if (item === USER_DATA) {
        user = undefined;
      }
      resolve();
    });
  }

  __setError(error) {
    throwError = error;
  }

  __setUser(item) {
    user = item;
  }

  __setSession(item) {
    session = item;
  }
}

function __setError(error) {
  throwError = error;
}

function __setUser(item) {
  user = item;
}

function __setSession(item) {
  session = item;
}

localforage.createInstance = createInstance;
localforage.__setError = __setError;
localforage.__setUser = __setUser;
localforage.__setSession = __setSession;

module.exports = localforage;
