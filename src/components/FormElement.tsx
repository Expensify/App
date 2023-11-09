import React, {ForwardedRef, forwardRef} from 'react';
import {View, ViewProps} from 'react-native';
import * as ComponentUtils from '@libs/ComponentUtils';

function FormElement(props: ViewProps, ref: ForwardedRef<View | HTMLFormElement | null>) {
    return (
        <View
            role={ComponentUtils.ACCESSIBILITY_ROLE_FORM}
            ref={ref as ForwardedRef<View>}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

FormElement.displayName = 'FormElement';

export default forwardRef(FormElement);
