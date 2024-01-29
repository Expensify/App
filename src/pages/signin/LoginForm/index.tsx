import type {ForwardedRef} from 'react';
import React, {forwardRef} from 'react';
import BaseLoginForm from './BaseLoginForm';
import type {InputHandle} from './types';
import type LoginFormProps from './types';

function LoginForm({scrollPageToTop}: LoginFormProps, ref: ForwardedRef<InputHandle>) {
    return (
        <BaseLoginForm
            scrollPageToTop={scrollPageToTop}
            ref={ref}
        />
    );
}

LoginForm.displayName = 'LoginForm';

export default forwardRef(LoginForm);
