import React from 'react';
import CONST from '@src/CONST';
import BaseValidateCodeForm from './BaseValidateCodeForm';
import type ValidateCodeFormProps from './types';

function ValidateCodeForm({ref, ...props}: ValidateCodeFormProps) {
    return (
        <BaseValidateCodeForm
            autoComplete={CONST.AUTO_COMPLETE_VARIANTS.ONE_TIME_CODE}
            ref={ref}
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...props}
        />
    );
}

ValidateCodeForm.displayName = 'SignInValidateCodeForm';

export default ValidateCodeForm;
