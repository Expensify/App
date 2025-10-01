import React, {forwardRef} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import BaseValidateCodeForm from './BaseValidateCodeForm';
import type {ValidateCodeFormHandle, ValidateCodeFormProps} from './BaseValidateCodeForm';

const ValidateCodeForm = forwardRef<ValidateCodeFormHandle, ValidateCodeFormProps>((props, ref) => (
    <GestureHandlerRootView>
        <BaseValidateCodeForm
            autoComplete="sms-otp"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            innerRef={ref}
        />
    </GestureHandlerRootView>
));

export default ValidateCodeForm;
