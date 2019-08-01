"use strict";

const localforage = jest.genMockFromModule("localforage");

function createInstance(options) {
  return new LocalForage(options);
}

let throwError = false;
let user = undefined;
let session = undefined;

class LocalForage {
  constructor(options) {
    this.sessionKey = options.sessionKey;
    this.sessionData = options.sessionData;
  }

  setItem(item, data) {
    return new Promise((resolve, reject) => {
      if (item === this.keys.sessionKey) {
        session = data;
      } else if (item === this.keys.sessionData) {
        user = data;
      }
      throwError ? reject() : resolve(data);
    });
  }

  getItem(item) {
    return new Promise(resolve => {
      if (item === this.sessionKey) {
        return resolve(session);
      } else if (item === this.sessionData) {
        return resolve(user);
      }
    });
  }

  removeItem(item) {
    return new Promise(resolve => {
      if (item === this.sessionKey) {
        session = undefined;
      } else if (item === this.sessionData) {
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

module.exports = ç;
