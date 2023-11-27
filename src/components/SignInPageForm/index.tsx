import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import FormElement from '@components/FormElement';
import SignInPageFormProps from './types';

const preventFormDefault = (event: SubmitEvent) => {
    // When enter is pressed form is submitted to action url (POST /).
    // As we are using controlled component, we need to disable it here.
    event.preventDefault();
};

function SignInPageForm(props: SignInPageFormProps) {
    const form = useRef<HTMLFormElement & View>(null);

    useEffect(() => {
        const formCurrent = form.current;

        if (!formCurrent) {
            return;
        }

        // Prevent the browser from applying its own validation, which affects the email input
        formCurrent.setAttribute('novalidate', '');

        // Password Managers need these attributes to be able to identify the form elements properly.
        formCurrent.setAttribute('method', 'post');
        formCurrent.setAttribute('action', '/');
        formCurrent.addEventListener('submit', preventFormDefault);

        return () => {
            if (!formCurrent) {
                return;
            }
            formCurrent.removeEventListener('submit', preventFormDefault);
        };
    }, []);

    return (
        <FormElement
            ref={form}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

SignInPageForm.displayName = 'SignInPageForm';

export default SignInPageForm;
