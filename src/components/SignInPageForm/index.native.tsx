import React from 'react';
import FormElement from '@components/FormElement';
import SignInPageFormProps from './types';

function SignInPageForm(props: SignInPageFormProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <FormElement {...props} />;
}

SignInPageForm.displayName = 'SignInPageForm';

export default SignInPageForm;
