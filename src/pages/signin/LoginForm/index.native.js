import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import BaseLoginForm from './BaseLoginForm';
import AppStateMonitor from '../../../libs/AppStateMonitor';

const propTypes = {
    /** Function used to scroll to the top of the page */
    scrollPageToTop: PropTypes.func,
};
const defaultProps = {
    scrollPageToTop: undefined,
};

function LoginForm(props) {
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
            ref={(ref) => (loginFormRef.current = ref)}
        />
    );
}

LoginForm.displayName = 'LoginForm';
LoginForm.propTypes = propTypes;
LoginForm.defaultProps = defaultProps;

export default LoginForm;
