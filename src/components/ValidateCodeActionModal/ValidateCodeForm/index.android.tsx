import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import CONST from '@src/CONST';
import BaseValidateCodeForm from './BaseValidateCodeForm';
import type {ValidateCodeFormProps} from './BaseValidateCodeForm';

function ValidateCodeForm(props: ValidateCodeFormProps) {
    return (
        <GestureHandlerRootView>
            <BaseValidateCodeForm
                autoComplete={CONST.AUTO_COMPLETE_VARIANTS.SMS_OTP}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </GestureHandlerRootView>
    );
}

export default ValidateCodeForm;
