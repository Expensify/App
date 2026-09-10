import React from 'react';
import {View} from 'react-native';

import type FormElementProps from './types';

function FormElement({ref, ...props}: FormElementProps) {
    return (
        <View
            ref={ref}
            {...props}
        />
    );
}

export default FormElement;
