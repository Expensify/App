import React, {forwardRef} from 'react';
import BaseValidateCodeForm from './BaseValidateCodeForm';
import type {ValidateCodeFormHandle, ValidateCodeFormProps} from './BaseValidateCodeForm';

const ValidateCodeForm = forwardRef<ValidateCodeFormHandle, ValidateCodeFormProps>((props, ref) => (
    <BaseValidateCodeForm
        autoComplete="one-time-code"
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));

export default ValidateCodeForm;
