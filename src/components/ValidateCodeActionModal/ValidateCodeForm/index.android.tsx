import React, {forwardRef} from 'react';
import BaseValidateCodeForm from './BaseValidateCodeForm';
import type {ValidateCodeFormHandle, ValidateCodeFormProps} from './BaseValidateCodeForm';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

const ValidateCodeForm = forwardRef<ValidateCodeFormHandle, ValidateCodeFormProps>((props, ref) => (
    <BaseValidateCodeForm
        autoComplete="sms-otp"
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));

export default gestureHandlerRootHOC(ValidateCodeForm);
