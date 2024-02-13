import type {ForwardedRef} from 'react';
import React, {forwardRef, useRef} from 'react';
import type {ViewProps} from 'react-native';
import {View} from 'react-native';
import useFormSetup from '@hooks/useFormSetup';
import * as ComponentUtils from '@libs/ComponentUtils';

function FormElement(props: ViewProps, outerRef: ForwardedRef<View>) {
    const formRef = useRef<View | null>(null);
    useFormSetup(formRef.current);
    return (
        <View
            role={ComponentUtils.ACCESSIBILITY_ROLE_FORM}
            ref={(ref) => {
                formRef.current = ref;
                if (typeof outerRef === 'function') {
                    outerRef(ref);
                } else if (outerRef && 'current' in outerRef) {
                    // eslint-disable-next-line no-param-reassign
                    outerRef.current = ref;
                }
            }}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

FormElement.displayName = 'FormElement';

export default forwardRef(FormElement);
