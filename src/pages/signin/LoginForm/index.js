import React from 'react';
import BaseLoginForm from './BaseLoginForm';
import {propTypes, defaultProps} from './loginFormPropTypes';

const propTypes = {
    /** Function used to scroll to the top of the page */    
    scrollPageToTop: PropTypes.func,
};
const defaultProps = {};

function LoginForm(props) {
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
