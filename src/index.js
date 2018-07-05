import { USER_SESSION, USER_DATA } from './constants';
import * as Cookies from "js-cookie";
import isPromise from 'is-promise';
import {
  getSessionSuccess,
  getSessionError,
  getUserSessionSuccess,
  getUserSessionError,
  invalidSession
} from './actions';
import reducer from './reducer';
import immutableReducer from './immutableReducer';

let instance;

export class sessionService {
  constructor(store, options) {
    instance = this;
    sessionService.setOptions(store, options);
    return instance;
  }

  static setOptions(store, {
    driver,
    validateSession,
    refreshOnCheckAuth = false,
    expires = 360,
    redirectPath = 'login',
    server = false
  } = {}) {
    instance.store = store;
    instance.refreshOnCheckAuth = refreshOnCheckAuth;
    instance.redirectPath = redirectPath;
    instance.expires = expires;
    instance.driver = driver;
    instance.server = server;
    instance.validateSession = validateSession;

    // configure the storage
    const storageOptions = {
      name: 'redux-react-session'
    };
    const localforage = require('localforage');
    if (driver && driver !== 'COOKIES') {
      storageOptions.driver = localforage[driver];
    }
    instance.storage = localforage.createInstance(storageOptions);
  }

  static initSessionService(store, options) {
    instance = new sessionService(store, options);
    return sessionService.refreshFromLocalStorage();
  }

  static initServerSession(store, req, options) {
    instance = new sessionService(store, { ...options, server: true });
    const parseCookies = (req) => {
      const list = {};
      const rc = req.get('cookie');
      rc && rc.split(';').forEach(cookie => {
        const parts = cookie.split('=');
        if (parts[0].trim() === USER_SESSION || parts[0].trim() === USER_DATA) {
          list[parts[0].trim()] = JSON.parse(decodeURIComponent(parts[1]));
        }
      });

      return list;
    };
    return sessionService.saveFromClient(parseCookies(req));
  }

  static saveFromClient(cookies) {
    return new Promise((resolve, reject) => {
      if (cookies[USER_SESSION]) {
        sessionService.saveSession(cookies[USER_SESSION])
        .then(() => {
          if (cookies[USER_DATA]) {
            sessionService.saveUser(cookies[USER_DATA])
            .then(() => resolve());
          }
        });
      } else {
        instance.store.dispatch(getSessionError());
        reject('Session not found');
      }
    });
  }

  static invalidateSession() {
    instance.store.dispatch(invalidSession());
    sessionService.deleteSession();
    sessionService.deleteUser();
  }

  static attemptLoadUser() {
    instance.store.dispatch(getSessionSuccess());
    return sessionService.loadUser().then((user) => {
      instance.store.dispatch(getUserSessionSuccess(user));
    }).catch(() => {
      instance.store.dispatch(getUserSessionError());
    });
  }

  static refreshFromLocalStorage() {
    return sessionService.loadSession()
    .then((session) => {
      if (instance.validateSession) {
        let value = instance.validateSession(session);

        if (isPromise(value)) {
          return value.then(valid => {
            if (!valid) {
              throw new Error("Session is invalid");
            }
            return this.attemptLoadUser();
          }).catch(() => {
            this.invalidateSession();
          });
        } else if (!value) {
          this.invalidateSession();
          return;
        }
      }
      return this.attemptLoadUser();
    })
    .catch(() => {
      instance.store.dispatch(getSessionError());
    });
  }

  static checkAuth(nextState, replace, next) {
    const { refreshOnCheckAuth, store } = instance;
    sessionService.loadSession()
    .then(() => {
      refreshOnCheckAuth && store.dispatch(getSessionSuccess());
      sessionService.loadUser().then((user) => {
        refreshOnCheckAuth && store.dispatch(getUserSessionSuccess(user));
        next();
      }).catch(() => next());
    })
    .catch(() => {
      refreshOnCheckAuth && store.dispatch(getSessionError());
      refreshOnCheckAuth && store.dispatch(getUserSessionError());
      replace({
        pathname: instance.redirectPath,
        state: { nextPathname: nextState.location.pathname }
      });
      next();
    });
  }

  static saveSession(session) {
    return new Promise((resolve) => {
      if (instance.server) {
        instance[USER_SESSION] = session;
        instance.store.dispatch(getSessionSuccess());
        resolve();
      } else if (instance.driver === 'COOKIES') {
        Cookies.set(USER_SESSION, session, { expires: instance.expires });
        instance.store.dispatch(getSessionSuccess());
        resolve();
      } else {
        instance.storage.setItem(USER_SESSION, session)
        .then(() => {
          instance.store.dispatch(getSessionSuccess());
          resolve();
        })
        .catch(() => {
          Cookies.set(USER_SESSION, session, { expires: instance.expires });
          instance.store.dispatch(getSessionSuccess());
          resolve();
        });
      }
    });
  }

  static loadSession() {
    return new Promise((resolve, reject) => {
      if (instance.server) {
        instance[USER_SESSION] ? resolve(instance[USER_SESSION]) : reject();
      } else if (instance.driver === 'COOKIES') {
        const cookies = Cookies.getJSON(USER_SESSION);
        cookies ? resolve(cookies) : reject('Session not found');
      } else {
        instance.storage.getItem(USER_SESSION)
        .then((currentSession) => {
          if (currentSession) {
            resolve(currentSession);
          } else {
            const cookies = Cookies.getJSON(USER_SESSION);
            cookies ? resolve(cookies) : reject('Session not found');
          }
        })
        .catch(err => reject(err));
      }
    });
  }

  static deleteSession() {
    return instance.storage.removeItem(USER_SESSION).then(() => {
      instance.store.dispatch(getSessionError());
      Cookies.remove(USER_SESSION);
      delete instance[USER_SESSION];
    });
  }

  static saveUser(user) {
    return new Promise((resolve) => {
      if (instance.server) {
        instance[USER_DATA] = user;
        instance.store.dispatch(getUserSessionSuccess(user));
        resolve();
      } else if (instance.driver === 'COOKIES') {
        Cookies.set(USER_DATA, user, { expires: instance.expires });
        instance.store.dispatch(getUserSessionSuccess(user));
        resolve();
      } else {
        instance.storage.setItem(USER_DATA, user)
        .then((user) => {
          instance.store.dispatch(getUserSessionSuccess(user));
          resolve();
        })
        .catch(() => {
          instance.store.dispatch(getUserSessionSuccess(user));
          Cookies.set(USER_DATA, user, { expires: instance.expires });
          resolve();
        });
      }
    });
  }

  static loadUser() {
    return new Promise((resolve, reject) => {
      if (instance.server) {
        instance[USER_DATA] ? resolve(instance[USER_DATA]) : reject();
      } else if (instance.driver === 'COOKIES') {
        const cookies = Cookies.getJSON(USER_DATA);
        cookies ? resolve(cookies) : reject('User not found');
      } else {
        instance.storage.getItem(USER_DATA)
        .then((currentUser) => {
          if (currentUser) {
            resolve(currentUser);
          } else {
            const cookies = Cookies.getJSON(USER_DATA);
            cookies ? resolve(cookies) : reject('User not found');
          }
        })
        .catch(err => reject(err));
      }
    });
  }

  static deleteUser() {
    return instance.storage.removeItem(USER_DATA).then(() => {
      instance.store.dispatch(getUserSessionError());
      Cookies.remove(USER_DATA);
      delete instance[USER_DATA];
    });
  }
}

export const sessionReducer = reducer;
export const sessionImmutableReducer = immutableReducer;
