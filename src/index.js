import * as constant from './constants';
import * as localForage from 'localforage';
import { browserHistory } from 'react-router';
import {
  getSessionSuccess,
  getSessionError,
  getUserSessionSuccess
} from './actions';
import reducer from './reducer';

let instance;

export class sessionService {
  constructor(store, refreshOnCheckAuth) {
    if (!instance) {
      instance = this;
      instance.store = store;
      instance.refreshOnCheckAuth = refreshOnCheckAuth;
    }
    return instance;
  }

  static initSessionService(store, refreshOnCheckAuth = false) {
    instance = new sessionService(store, refreshOnCheckAuth);
    sessionService.refreshFromLocalStorage();
  }

  static refreshFromLocalStorage() {
    sessionService.isLogged()
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
    sessionService.isLogged()
    .then(() => {
      refreshOnCheckAuth && store.dispatch(getSessionSuccess());
      sessionService.loadUser().then((user) => {
        refreshOnCheckAuth && store.dispatch(getUserSessionSuccess(user));
        next();
      });
    })
    .catch(() => {
      refreshOnCheckAuth && store.dispatch(getSessionError());
      replace({
        pathname: '/login',
        state: { nextPathname: nextState.location.pathname }
      });
      next();
    });
  }

  static loadSession() {
    return localForage.getItem(constant.USER_SESSION)
    .then(value => value)
    .catch(err => err);
  }

  static saveSession(session) {
    return localForage.setItem(constant.USER_SESSION, session)
    .then(() => instance.store.dispatch(getSessionSuccess()))
    .catch(() => instance.store.dispatch(getSessionError()));
  }

  static deleteSession() {
    return localForage.removeItem(constant.USER_SESSION).then(() => {
      instance.store.dispatch(getSessionError());
      browserHistory.replace('/login');
    });
  }

  static saveUser(user) {
    return localForage.setItem(constant.USER_DATA, user).then((user) => {
      instance.store.dispatch(getUserSessionSuccess(user));
    });
  }

  static deleteUser() {
    return localForage.removeItem(constant.USER_DATA);
  }

  static loadUser() {
    return localForage.getItem(constant.USER_DATA)
    .then(value => value)
    .catch(err => err);
  }

  static isLogged() {
    return new Promise((resolve, reject) => {
      sessionService.loadSession()
      .then((currentSession) => {
        if (currentSession && currentSession.token) {
          resolve(currentSession);
        } else {
          reject();
        }
      });
    });
  }
}

export const sessionReducer = reducer;
