import React from 'react';

import type LoginFormProps from './types';

import BaseLoginForm from './BaseLoginForm';

function LoginForm({ref, ...props}: LoginFormProps) {
    return (
        <BaseLoginForm
            {...props}
            ref={ref}
        />
    );
}

export default LoginForm;
