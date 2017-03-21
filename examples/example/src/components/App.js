// This component handles the App template used on every page.
import React, { PropTypes } from 'react';

const App = ({ children }) => (
  <div>
    {children}
  </div>
);

const { object } = PropTypes;

App.propTypes = {
  children: object.isRequired
};

export default App;
