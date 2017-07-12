import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { logout } from '../actions/sessionActions';

const LogoutButton = ({ history, logout }) => (
  <button
    onClick={() => logout(history)}
  >
    LOGOUT
  </button>
);

const { object, func } = PropTypes;

LogoutButton.propTypes = ({
  history: object.isRequired,
  logout: func.isRequired
});

const mapDispatch = dispatch => ({
  logout: history => dispatch(logout(history))
});

export default connect(null, mapDispatch)(withRouter(LogoutButton));
