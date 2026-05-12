import React, {useEffect, useImperativeHandle, useRef} from 'react';
import AppStateMonitor from '@libs/AppStateMonitor';
import BaseLoginForm from './BaseLoginForm';
import type {InputHandle} from './types';
import type LoginFormProps from './types';

function LoginForm({scrollPageToTop, ref, ...rest}: LoginFormProps) {
    const loginFormRef = useRef<InputHandle>(null);

    useImperativeHandle(ref, () => ({
        isInputFocused: loginFormRef.current ? loginFormRef.current.isInputFocused : () => false,
        clearDataAndFocus: loginFormRef.current ? loginFormRef.current?.clearDataAndFocus : () => null,
    }));

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
            ref={loginFormRef}
        />
    );
}

export default LoginForm;
