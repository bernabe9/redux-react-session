import { browserHistory } from 'react-router';
import { sessionService } from 'redux-react-session';
import * as sessionApi from '../api/sessionApi';

export const login = (user) =>
  () =>
    sessionApi.login(user).then(response => {
      const { token, data } = response;
      sessionService.saveSession({ token })
      .then(() => {
        sessionService.saveUser(data)
        .then(() => {
          browserHistory.replace('/');
        });
      });
    });

export const logout = () =>
  () =>
    sessionApi.logout().then(() => {
      sessionService.deleteSession();
      sessionService.deleteUser();
      browserHistory.replace('/login');
    }).catch(err => {
      throw (err);
    });
