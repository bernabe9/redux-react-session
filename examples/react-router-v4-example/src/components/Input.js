import React, { PropTypes } from 'react';

const Input = ({ name, value, label, type, onChange }) => (
  <div>
    {label && <label>{label}</label>}
    <div>
      <input {...{ name, value, type, onChange }}/>
    </div>
  </div>
);

const { string, func } = PropTypes;

Input.propTypes = {
  name: string.isRequired,
  value: string.isRequired,
  label: string,
  type: string.isRequired,
  onChange: func.isRequired
};

export default Input;
