import PropTypes from 'prop-types';
import React, {useEffect, useRef} from 'react';
import _ from 'underscore';
import refPropTypes from '@components/refPropTypes';
import AppStateMonitor from '@libs/AppStateMonitor';
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
    const loginFormRef = useRef();
    const {scrollPageToTop} = props;

    useEffect(() => {
        if (!scrollPageToTop) {
            return;
        }

        const unsubscribeToBecameActiveListener = AppStateMonitor.addBecameActiveListener(() => {
            const isInputFocused = loginFormRef.current && loginFormRef.current.isInputFocused();
            if (!isInputFocused) {
                return;
            }

            scrollPageToTop();
        });

        return unsubscribeToBecameActiveListener;
    }, [scrollPageToTop]);

    return (
        <BaseLoginForm
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={(ref) => {
                loginFormRef.current = ref;
                if (typeof innerRef === 'function') {
                    innerRef(ref);
                } else if (innerRef && _.has(innerRef, 'current')) {
                    // eslint-disable-next-line no-param-reassign
                    innerRef.current = ref;
                }
            }}
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
