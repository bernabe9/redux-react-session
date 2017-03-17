import * as constant from './constants';
import * as localForage from 'localforage';
import {
  getSessionSuccess,
  getSessionError,
  getUserSessionSuccess,
  getUserSessionError
} from './actions';
import reducer from './reducer';

let instance;

export class sessionService {
  constructor(store, refreshOnCheckAuth, redirectPath) {
    if (!instance) {
      instance = this;
      instance.store = store;
      instance.refreshOnCheckAuth = refreshOnCheckAuth;
      instance.redirectPath = redirectPath;
    }
    return instance;
  }

  static setOptions(store, refreshOnCheckAuth = false, redirectPath = 'login') {
    instance.store = store;
    instance.refreshOnCheckAuth = refreshOnCheckAuth;
    instance.redirectPath = redirectPath;
  }

  static initSessionService(store, refreshOnCheckAuth = false, redirectPath = 'login') {
    instance = new sessionService(store, refreshOnCheckAuth, redirectPath);
    sessionService.refreshFromLocalStorage();
  }

  static refreshFromLocalStorage() {
    return sessionService.loadSession()
    .then(() => {
      instance.store.dispatch(getSessionSuccess());
      sessionService.loadUser().then((user) => {
        instance.store.dispatch(getUserSessionSuccess(user));
      });
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
    return localForage.setItem(constant.USER_SESSION, session)
    .then(() => instance.store.dispatch(getSessionSuccess()))
    .catch(() => instance.store.dispatch(getSessionError()));
  }

  static loadSession() {
    return new Promise((resolve, reject) => {
      localForage.getItem(constant.USER_SESSION)
      .then((currentSession) => {
        if (currentSession) {
          resolve(currentSession);
        } else {
          reject('Session not found');
        }
      })
      .catch(err => reject(err));
    });
  }

  static deleteSession() {
    return localForage.removeItem(constant.USER_SESSION).then(() => {
      instance.store.dispatch(getSessionError());
    }).catch(err => err);
  }

  static saveUser(user) {
    return localForage.setItem(constant.USER_DATA, user)
    .then((user) => instance.store.dispatch(getUserSessionSuccess(user)))
    .catch(() => instance.store.dispatch(getUserSessionError(user)));
  }

  static loadUser() {
    return new Promise((resolve, reject) => {
      localForage.getItem(constant.USER_DATA)
      .then((currentUser) => {
        if (currentUser) {
          resolve(currentUser);
        } else {
          reject('User not found');
        }
      })
      .catch(err => reject(err));
    });
  }

  static deleteUser() {
    return localForage.removeItem(constant.USER_DATA).then(() => {
      instance.store.dispatch(getUserSessionError());
    }).catch(err => err);
  }
}

export const sessionReducer = reducer;
