import type {ForwardedRef} from 'react';
import React, {useEffect, useRef} from 'react';
import type {ViewProps} from 'react-native';
import {View} from 'react-native';
import {ACCESSIBILITY_ROLE_FORM} from '@libs/ComponentUtils/index';
import mergeRefs from '@libs/mergeRefs';

type FormElementProps = ViewProps & {
    ref?: ForwardedRef<View>;
};

const preventFormDefault = (event: SubmitEvent) => {
    // When Enter is pressed, the form is submitted to the action URL (POST /).
    // As we are using a controlled component, we need to disable this behavior here.
    event.preventDefault();
};

function FormElement({ref, ...props}: FormElementProps) {
    const formRef = useRef<HTMLFormElement & View>(null);
    const mergedRef = mergeRefs(formRef, ref);

    useEffect(() => {
        const formCurrent = formRef.current;

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
            formCurrent.removeEventListener('submit', preventFormDefault);
        };
    }, []);

    return (
        <View
            role={ACCESSIBILITY_ROLE_FORM}
            ref={mergedRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default FormElement;

export type {FormElementProps};
