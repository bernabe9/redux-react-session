import * as Cookies from 'js-cookie';
import localforage from 'localforage';

let storage;

export function getStorage(driver, expires = 360) {
  if (driver === 'COOKIES') {
    storage.setItem = (key, value) =>
      Cookies.set(key, value, { expires: expires });
    storage.getItem = (key, callback) => {
      const cookies = Cookies.getJSON(key);
      return cookies || callback();
    };
    storage.removeItem = key =>
      Cookies.remove(key);
  }
  const { getItem, setItem, removeItem } = storage;
  const customDriver = {
    _driver: 'customDriver',
    getItem,
    removeItem,
    setItem
  };
  localforage.defineDriver(customDriver);
  localforage.setDriver(localforage.customDriver);
}
