import React, {ForwardedRef, forwardRef} from 'react';
import {View, ViewStyle} from 'react-native';
import * as ComponentUtils from '../libs/ComponentUtils';

function FormElement(props: {style: ViewStyle; children: React.ReactNode}, ref: ForwardedRef<View | null>) {
    console.debug('hej', JSON.stringify(ref));
    return (
        <View
            accessibilityRole={ComponentUtils.ACCESSIBILITY_ROLE_FORM}
            accessibilityAutoComplete="on"
            ref={ref}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

FormElement.displayName = 'BaseForm';
export default forwardRef(FormElement);
