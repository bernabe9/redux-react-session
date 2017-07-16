import path from 'path';
import { Server } from 'http';
import Express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import { Provider } from 'react-redux';
import { combineReducers, createStore, compose, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { sessionService, sessionReducer } from 'redux-react-session';
// reuse same client routes
import routes from '../src/routes';

// initialize the server and configure support for ejs templates
const app = new Express();
const server = new Server(app);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// define the folder that will be used for static assets
app.use(Express.static(path.join(__dirname, 'static')));

const handleRender = (req, res) => {
  // Add the sessionReducer
  const reducer = combineReducers({
    session: sessionReducer
  });
  // Create a new Redux store instance
  const store = createStore(reducer, undefined, compose(applyMiddleware(thunkMiddleware)));

  sessionService.initServerSession(store, req);

  match(
    { routes, location: req.url },
    (err, redirectLocation, renderProps) => {

      // in case of error display the error message
      if (err) {
        return res.status(500).send(err.message);
      }

      // in case of redirect propagate the redirect to the browser
      if (redirectLocation) {
        return res.redirect(302, redirectLocation.pathname + redirectLocation.search);
      }

      // generate the React markup for the current route
      let markup;
      if (renderProps) {
        // if the current route matched we have renderProps
        markup = renderToString(
          <Provider store={store} key="provider">
            <RouterContext {...renderProps} />
          </Provider>
        );
      }

      // Grab the initial state from our Redux store
      const preloadedState = JSON.stringify(store.getState()).replace(/</g, '\\u003c');

      // render the index template with the embedded React markup
      return res.render('index', { markup, preloadedState });
    }
  );
};

// This is fired every time the server side receives a request
app.use(handleRender);

// start the server
const port = process.env.PORT || 8000;
server.listen(port, err => {
  if (err) {
    return console.error(err);
  }
  console.info(`Server running on http://localhost:${port}`);
});
