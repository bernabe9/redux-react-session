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

function setItem(item, data) {
  return new Promise((resolve, reject) => {
    if (item === USER_SESSION) {
      session = data;
    } else if (item === USER_DATA) {
      user = data;
    }
    throwError ? reject() : resolve(data);
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

function removeItem(item) {
  return new Promise((resolve) => {
    if (item === USER_SESSION) {
      session = undefined;
    } else if (item === USER_DATA) {
      user = undefined;
    }
    resolve();
  });
}

localforage.setItem = setItem;
localforage.getItem = getItem;
localforage.removeItem = removeItem;
localforage.__setError = __setError;
localforage.__setUser = __setUser;
localforage.__setSession = __setSession;

module.exports = localforage;
