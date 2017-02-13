# Redux React Session

[![NPM version][npm-image]][npm-url]

Keep your session sync with localStorage and redux

Redux React Session provides an API that allows to manage sessions through the app

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

2. Create the session service:
```javascript
import { createStore } from 'redux';
import { sessionService } from 'redux-react-session';

const store = createStore(reducer)

sessionService.initSessionService(store);
```

[npm-image]: https://img.shields.io/badge/npm-v1.0.2-blue.svg
[npm-url]: https://npmjs.org/package/redux-react-session
