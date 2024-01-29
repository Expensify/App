import type {ForwardedRef} from 'react';
import React, {forwardRef, useEffect, useRef} from 'react';
import AppStateMonitor from '@libs/AppStateMonitor';
import BaseLoginForm from './BaseLoginForm';
import type {InputHandle} from './types';
import type LoginFormProps from './types';

function LoginForm({scrollPageToTop, ...rest}: LoginFormProps, ref: ForwardedRef<InputHandle>) {
    const loginFormRef = useRef<InputHandle>(ref);

    useEffect(() => {
        if (!scrollPageToTop) {
            return;
        }

        return AppStateMonitor.addBecameActiveListener(() => {
            const isInputFocused = loginFormRef.current?.isInputFocused();
            if (!isInputFocused) {
                return;
            }

            scrollPageToTop();
        });
    }, [scrollPageToTop]);

    return (
        <BaseLoginForm
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            scrollPageToTop={scrollPageToTop}
            ref={ref}
        />
    );
}

LoginForm.displayName = 'LoginForm';

export default forwardRef(LoginForm);
