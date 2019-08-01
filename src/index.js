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
    server = false,
    sessionKey,
    sessionData,
    
  } = {}) {
    instance.store = store;
    instance.refreshOnCheckAuth = refreshOnCheckAuth;
    instance.redirectPath = redirectPath;
    instance.expires = expires;
    instance.driver = driver;
    instance.server = server;
    instance.validateSession = validateSession;
    instance.sessionKey = sessionKey;
    instance.sessionData = sessionData;

    // configure the storage
    const storageOptions = {
      name: 'redux-react-session',
      sessionKey: sessionKey,
      sessionData: sessionData
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
        if (parts[0].trim() === instance.sessionKey || parts[0].trim() === instance.sessionData) {
          list[parts[0].trim()] = JSON.parse(decodeURIComponent(parts[1]));
        }
      });

      return list;
    };
    return sessionService.saveFromClient(parseCookies(req));
  }

  static saveFromClient(cookies) {
    return new Promise((resolve, reject) => {
      if (cookies[instance.sessionKey]) {
        sessionService.saveSession(cookies[instance.sessionKey])
        .then(() => {
          if (cookies[instance.sessionData]) {
            sessionService.saveUser(cookies[instance.sessionData])
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
        instance[instance.sessionKey] = session;
        instance.store.dispatch(getSessionSuccess());
        resolve();
      } else if (instance.driver === 'COOKIES') {
        Cookies.set(instance.sessionKey, session, { expires: instance.expires });
        instance.store.dispatch(getSessionSuccess());
        resolve();
      } else {
        instance.storage.setItem(instance.sessionKey, session)
        .then(() => {
          instance.store.dispatch(getSessionSuccess());
          resolve();
        })
        .catch(() => {
          Cookies.set(instance.sessionKey, session, { expires: instance.expires });
          instance.store.dispatch(getSessionSuccess());
          resolve();
        });
      }
    });
  }

  static loadSession() {
    return new Promise((resolve, reject) => {
      if (instance.server) {
        instance[instance.sessionKey] ? resolve(instance[instance.sessionKey]) : reject();
      } else if (instance.driver === 'COOKIES') {
        const cookies = Cookies.getJSON(instance.sessionKey);
        cookies ? resolve(cookies) : reject('Session not found');
      } else {
        instance.storage.getItem(instance.sessionKey)
        .then((currentSession) => {
          if (currentSession) {
            resolve(currentSession);
          } else {
            const cookies = Cookies.getJSON(instance.sessionKey);
            cookies ? resolve(cookies) : reject('Session not found');
          }
        })
        .catch(err => reject(err));
      }
    });
  }

  static deleteSession() {
    return instance.storage.removeItem(instance.sessionKey).then(() => {
      instance.store.dispatch(getSessionError());
      Cookies.remove(instance.sessionKey);
      delete instance[instance.sessionKey];
    });
  }

  static saveUser(user) {
    return new Promise((resolve) => {
      if (instance.server) {
        instance[instance.sessionData] = user;
        instance.store.dispatch(getUserSessionSuccess(user));
        resolve();
      } else if (instance.driver === 'COOKIES') {
        Cookies.set(instance.sessionData, user, { expires: instance.expires });
        instance.store.dispatch(getUserSessionSuccess(user));
        resolve();
      } else {
        instance.storage.setItem(instance.sessionData, user)
        .then((user) => {
          instance.store.dispatch(getUserSessionSuccess(user));
          resolve();
        })
        .catch(() => {
          instance.store.dispatch(getUserSessionSuccess(user));
          Cookies.set(instance.sessionData, user, { expires: instance.expires });
          resolve();
        });
      }
    });
  }

  static loadUser() {
    return new Promise((resolve, reject) => {
      if (instance.server) {
        instance[instance.sessionData] ? resolve(instance[instance.sessionData]) : reject();
      } else if (instance.driver === 'COOKIES') {
        const cookies = Cookies.getJSON(instance.sessionData);
        cookies ? resolve(cookies) : reject('User not found');
      } else {
        instance.storage.getItem(instance.sessionData)
        .then((currentUser) => {
          if (currentUser) {
            resolve(currentUser);
          } else {
            const cookies = Cookies.getJSON(instance.sessionData);
            cookies ? resolve(cookies) : reject('User not found');
          }
        })
        .catch(err => reject(err));
      }
    });
  }

  static deleteUser() {
    return instance.storage.removeItem(instance.sessionData).then(() => {
      instance.store.dispatch(getUserSessionError());
      Cookies.remove(instance.sessionData);
      delete instance[instance.sessionData];
    });
  }
}

export const sessionReducer = reducer;
