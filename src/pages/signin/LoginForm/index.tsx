import type {ForwardedRef} from 'react';
import React, {forwardRef} from 'react';
import BaseLoginForm from './BaseLoginForm';
import type {InputHandle} from './types';
import type LoginFormProps from './types';

function LoginForm(props: LoginFormProps, ref: ForwardedRef<InputHandle>) {
    return (
        <BaseLoginForm
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
        />
    );
}

LoginForm.displayName = 'LoginForm';

export default forwardRef(LoginForm);
