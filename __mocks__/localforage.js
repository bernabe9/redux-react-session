'use strict';

import { USER_SESSION, USER_DATA } from '../src/constants';

const localforage = jest.genMockFromModule('localforage');

let throwError = false;
let user = undefined;
let session = undefined;

function __setError(error) {
  throwError = error;
}

function __setUser(item) {
  user = item;
}

function __setSession(item) {
  session = item;
}

function setItem() {
  return new Promise((resolve, reject) => {
    throwError ? reject() : resolve();
  });
}

function getItem(item) {
  return new Promise((resolve) => {
    if (item === USER_SESSION) {
      return resolve(session);
    } else if (item === USER_DATA) {
      return resolve(user);
    }
  });
}

localforage.setItem = setItem;
localforage.getItem = getItem;
localforage.__setError = __setError;
localforage.__setUser = __setUser;
localforage.__setSession = __setSession;

module.exports = localforage;
