import React from 'react';
import {View} from 'react-native';
import type {FormElementProps} from './index';

function FormElement({ref, ...props}: FormElementProps) {
    return (
        <View
            ref={ref}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default FormElement;
