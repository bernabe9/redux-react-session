/* eslint-disable import/default */

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { combineReducers, createStore, compose, applyMiddleware } from 'redux';
import { sessionService, sessionReducer } from 'redux-react-session';
import thunkMiddleware from 'redux-thunk';
import App from './components/App';

// Add the sessionReducer
const reducer = combineReducers({
  session: sessionReducer
});

const store = createStore(reducer, undefined, compose(applyMiddleware(thunkMiddleware)));

// Init the session service
sessionService.initSessionService(store);

render(
  <Provider store={store}>
    <App />
  </Provider>, document.getElementById('app')
);
