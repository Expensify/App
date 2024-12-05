import React, {forwardRef} from 'react';
import BaseValidateCodeForm from './BaseValidateCodeForm';
import type {BaseValidateCodeFormProps, ValidateCodeFormHandle} from './BaseValidateCodeForm';

const ValidateCodeForm = forwardRef<ValidateCodeFormHandle, BaseValidateCodeFormProps>((props, ref) => (
    <BaseValidateCodeForm
        autoComplete="one-time-code"
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));

export default ValidateCodeForm;
