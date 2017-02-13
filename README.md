# Redux React Session

[![NPM version][npm-image]][npm-url]

Keep your session sync with localStorage and redux

Redux React Session provides an API that allows to manage sessions through the app, with authorization function for [react-router](https://github.com/ReactTraining/react-router) and a persisted session.

## Installation
`npm install redux-react-session --save`

## Usage

1. Add the session reducer:
```javascript
import { combineReducers } from 'redux';
import { sessionReducer } from 'redux-react-session';

const reducers = {
  // ... your other reducers here ...
  session: sessionReducer
};
const reducer = combineReducers(reducers);
```

2. Initiate the session service:
```javascript
import { createStore } from 'redux';
import { sessionService } from 'redux-react-session';

const store = createStore(reducer)

sessionService.initSessionService(store);
```

## API

### initSessionService(store, refreshOnCheckAuth:Boolean, redirectPath:String)
Initialize a singleton instance of the session service.

Options:
- store: Mandatory option, is used to keep sync the localStorage with Redux store
- refreshOnCheckAuth(default: false): Refresh Redux store in the `checkAuth` function
- redirectPath(default: "login"): Path used when a session is rejected or doesn't exist

### refreshFromLocalStorage
Force to refresh the Redux Store from the localStorage.

Note: this function is called once the session service is initialized

### checkAuth
Authorization function for [react-router](https://github.com/ReactTraining/react-router) to restrict routes, it checks if exist a session and redirects to the `redirectPath`

Example:
```javascript 
import React from 'react';
import { Route, IndexRoute } from 'react-router';
import { sessionService } from 'redux-react-session';
import App from './components/App';
import HomePage from './containers/HomePage';
import LoginPage from './containers/LoginPage';

export default (
  <Route path="/" component={App}>
    <IndexRoute onEnter={sessionService.checkAuth} component={HomePage} />
    <Route path="login" component={LoginPage} />
  </Route>
);
```

### isLogged : Promise(currentSession:Object)
Check if exists a session persisted in the localStorage

Example:
```javascript 
isLogged
.then(currentSession => console.log(currentSession))
.catch(() => console.log("Upss there aren't any session"))
```

### saveSession(session:object) : Promise
Saves the session object in the localStorage and changes the `authenticated` flag to `true` in Redux Store

### loadSession : Promise(currentSession:Object)
Returns the current session or an error

### deleteSession : Promise
Deletes the current session

### saveUser(user:object) : Promise
Saves the user object in the localStorage and in the Redux Store

### loadUser : Promise
Returns the current user or an error

### deleteUser : Promise
Deletes the current user


[npm-image]: https://img.shields.io/badge/npm-v1.0.2-blue.svg
[npm-url]: https://npmjs.org/package/redux-react-session
