import React, {forwardRef} from 'react';
import type {ForwardedRef} from 'react';
import BaseValidateCodeForm from './BaseValidateCodeForm';
import type {BaseValidateCodeFormRef} from './BaseValidateCodeForm';
import type ValidateCodeFormProps from './types';

function ValidateCodeForm(props: ValidateCodeFormProps, ref: ForwardedRef<BaseValidateCodeFormRef>) {
    return (
        <BaseValidateCodeForm
            autoComplete="sms-otp"
            ref={ref}
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...props}
        />
    );
}

ValidateCodeForm.displayName = 'ValidateCodeForm';

export default forwardRef(ValidateCodeForm);
