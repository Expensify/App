import React from 'react';
import BaseLoginForm from './BaseLoginForm';
import {propTypes, defaultProps} from './loginFormPropTypes';

function LoginForm(props) {
    // TODO: Implement scrolling to top when AppState changes to visible

    return (
        <BaseLoginForm
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

LoginForm.displayName = 'LoginForm';
LoginForm.propTypes = propTypes;
LoginForm.defaultProps = defaultProps;

export default LoginForm;
