import React from 'react';
import CONST from '@src/CONST';
import BaseValidateCodeForm from './BaseValidateCodeForm';
import type {ValidateCodeFormProps} from './BaseValidateCodeForm';

function ValidateCodeForm(props: ValidateCodeFormProps) {
    return (
        <BaseValidateCodeForm
            autoComplete={CONST.AUTO_COMPLETE_VARIANTS.ONE_TIME_CODE}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default ValidateCodeForm;
