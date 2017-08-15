import { USER_SESSION, USER_DATA } from './constants';
import {
  getSessionSuccess,
  getSessionError,
  getUserSessionSuccess,
  getUserSessionError
} from './actions';
import { getStorage } from './storages';

let instance;

class sessionService {
  constructor(store, options) {
    instance = this;
    sessionService.setOptions(store, options);
    return instance;
  }

  static setOptions(store, {
    driver,
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

    driver && driver !== 'COOKIES' && localForage.setDriver(localForage[driver]);
  }

  static initSessionService(store, options) {
    instance = new sessionService(store, options);
    sessionService.refreshFromLocalStorage();
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
    sessionService.saveFromClient(parseCookies(req));
  }

  static saveFromClient(cookies) {
    if (cookies[USER_SESSION]) {
      sessionService.saveSession(cookies[USER_SESSION])
      .then(() => {
        if (cookies[USER_DATA]) {
          sessionService.saveUser(cookies[USER_DATA]);
        }
      });
    }
  }

  static refreshFromLocalStorage() {
    return sessionService.loadSession()
    .then(() => {
      instance.store.dispatch(getSessionSuccess());
      sessionService.loadUser().then((user) => {
        instance.store.dispatch(getUserSessionSuccess(user));
      })
      .catch(() => {
        instance.store.dispatch(getUserSessionError());
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
        localForage.setItem(USER_SESSION, session)
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
        localForage.getItem(USER_SESSION)
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
    return localForage.removeItem(USER_SESSION).then(() => {
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
        localForage.setItem(USER_DATA, user)
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
        localForage.getItem(USER_DATA)
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
    return localForage.removeItem(USER_DATA).then(() => {
      instance.store.dispatch(getUserSessionError());
      Cookies.remove(USER_DATA);
      delete instance[USER_DATA];
    });
  }
};

export default sessionService;
