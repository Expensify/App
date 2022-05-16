import React, {forwardRef} from 'react';
import {View} from 'react-native';
import * as ComponentUtils from '../libs/ComponentUtils';

const FormElement = forwardRef((props, ref) => (
    <View
        accessibilityRole={ComponentUtils.ACCESSIBILITY_ROLE_FORM}
        accessibilityAutoComplete="on"
        ref={ref}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    />
));

FormElement.displayName = 'BaseForm';
export default FormElement;
