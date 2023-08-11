import React, {useEffect, useRef} from 'react';
import BaseLoginForm from './BaseLoginForm';
import {propTypes, defaultProps} from './loginFormPropTypes';
import AppStateMonitor from '../../../libs/AppStateMonitor';

function LoginForm(props) {
    const loginFormRef = useRef();
    const {scrollPageToTop} = props;

    useEffect(() => {
        if (scrollPageToTop) {
            return;
        }

        const unsubscribeToBecameActiveListener = AppStateMonitor.addBecameActiveListener(() => {
            const isInputFocused = loginFormRef.current && loginFormRef.current.isInputFocused();
            if (!isInputFocused) {
                return;
            }

            scrollPageToTop();
        });

        // Remove the subscription on cleanup
        return unsubscribeToBecameActiveListener;
    }, [scrollPageToTop]);

    return (
        <BaseLoginForm
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={(ref) => (loginFormRef.current = ref)}
        />
    );
}

LoginForm.displayName = 'LoginForm';
LoginForm.propTypes = propTypes;
LoginForm.defaultProps = defaultProps;

export default LoginForm;
