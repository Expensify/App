import React, {forwardRef} from 'react';
import BaseValidateCodeForm from './BaseValidateCodeForm';

const ValidateCodeForm = forwardRef((props, ref) => (
    <BaseValidateCodeForm
        autoComplete="sms-otp"
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));

ValidateCodeForm.displayName = 'ValidateCodeForm';

export default ValidateCodeForm;
