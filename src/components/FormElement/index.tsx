import type {ForwardedRef} from 'react';
import React, {forwardRef, useEffect, useRef} from 'react';
import type {ViewProps} from 'react-native';
import {View} from 'react-native';
import * as ComponentUtils from '@libs/ComponentUtils';
import mergeRefs from '@libs/mergeRefs';

const preventFormDefault = (event: SubmitEvent) => {
    // When Enter is pressed, the form is submitted to the action URL (POST /).
    // As we are using a controlled component, we need to disable this behavior here.
    event.preventDefault();
};

function FormElement(props: ViewProps, outerRef: ForwardedRef<View>) {
    const formRef = useRef<HTMLFormElement & View>(null);
    // eslint-disable-next-line react-compiler/react-compiler
    const mergedRef = mergeRefs(formRef, outerRef);

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
            role={ComponentUtils.ACCESSIBILITY_ROLE_FORM}
            ref={mergedRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

FormElement.displayName = 'FormElement';

export default forwardRef(FormElement);
