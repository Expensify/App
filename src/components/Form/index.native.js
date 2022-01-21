import React from 'react';
import BaseForm from './BaseForm';

// eslint-disable-next-line react/jsx-props-no-spreading
const Form = props => <BaseForm {...props} />;

Form.displayName = 'Form';
export default Form;
