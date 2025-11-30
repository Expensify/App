import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import BaseValidateCodeForm from './BaseValidateCodeForm';
import type {ValidateCodeFormProps} from './BaseValidateCodeForm';

function ValidateCodeForm(props: ValidateCodeFormProps) {
    return (
        <GestureHandlerRootView>
            <BaseValidateCodeForm
                autoComplete="sms-otp"
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </GestureHandlerRootView>
    );
}

export default ValidateCodeForm;
