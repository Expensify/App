import type {ForwardedRef} from 'react';
import React, {forwardRef, useRef} from 'react';
import type {ViewProps} from 'react-native';
import {View} from 'react-native';
import useFormSetup from '@hooks/useFormSetup';
import * as ComponentUtils from '@libs/ComponentUtils';
import mergeRefs from '@libs/mergeRefs';

function FormElement(props: ViewProps, outerRef: ForwardedRef<View>) {
    const formRef = useRef<View | null>(null);

    useFormSetup(formRef.current);

    const mergedRef = mergeRefs(formRef, outerRef);

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
