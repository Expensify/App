import PropTypes from 'prop-types';
import React from 'react';
import refPropTypes from '@components/refPropTypes';
import BaseLoginForm from './BaseLoginForm';

const propTypes = {
    /** Function used to scroll to the top of the page */
    scrollPageToTop: PropTypes.func,

    /** A reference so we can expose clearDataAndFocus */
    innerRef: refPropTypes,
};
const defaultProps = {
    scrollPageToTop: undefined,
    innerRef: () => {},
};

function LoginForm({innerRef, ...props}) {
    return (
        <BaseLoginForm
            ref={innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
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
