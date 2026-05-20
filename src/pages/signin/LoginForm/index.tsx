import React from 'react';
import BaseLoginForm from './BaseLoginForm';
import type LoginFormProps from './types';

function LoginForm({ref, ...props}: LoginFormProps) {
    return (
        <BaseLoginForm
            {...props}
            ref={ref}
        />
    );
}

export default LoginForm;
