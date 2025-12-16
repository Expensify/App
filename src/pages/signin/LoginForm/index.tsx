import React from 'react';
import BaseLoginForm from './BaseLoginForm';
import type LoginFormProps from './types';

function LoginForm({ref, ...props}: LoginFormProps) {
    return (
        <BaseLoginForm
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
        />
    );
}

export default LoginForm;
