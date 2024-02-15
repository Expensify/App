import type {ForwardedRef} from 'react';
import React, {forwardRef} from 'react';
import type {ViewProps} from 'react-native';
import {View} from 'react-native';

function FormElement(props: ViewProps, ref: ForwardedRef<View>) {
    return (
        <View
            ref={ref}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

FormElement.displayName = 'FormElement';

export default forwardRef(FormElement);
