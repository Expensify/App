import React from 'react';
import BaseValidateCodeForm from './BaseValidateCodeForm';

// eslint-disable-next-line react/jsx-props-no-spreading
const ValidateCodeForm = (props) => <BaseValidateCodeForm autoComplete="one-time-code" {...props} />;

ValidateCodeForm.displayName = 'ValidateCodeForm';

export default ValidateCodeForm;
