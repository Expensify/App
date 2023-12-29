import PropTypes from 'prop-types';
import React from 'react';
import BaseLoginForm from './BaseLoginForm';

const propTypes = {
    /** Function used to scroll to the top of the page */
    scrollPageToTop: PropTypes.func,
};
const defaultProps = {
    scrollPageToTop: undefined,
};

function LoginForm({innerRef, ...props}) { 
    <BaseLoginForm
        ref={innerRef}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    />
}

LoginForm.displayName = 'LoginForm';
LoginForm.propTypes = propTypes;
LoginForm.defaultProps = defaultProps;

const LoginFormWithRef = React.forwardRef((props, ref) => (
    <LoginForm
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));

LoginFormWithRef.displayName = 'LoginFormWithRef';

export default LoginFormWithRef;
