import CONST from '@src/CONST';

import React from 'react';

import type {ValidateCodeFormProps} from './BaseValidateCodeForm';

import BaseValidateCodeForm from './BaseValidateCodeForm';

function ValidateCodeForm(props: ValidateCodeFormProps) {
    return (
        <BaseValidateCodeForm
            autoComplete={CONST.AUTO_COMPLETE_VARIANTS.ONE_TIME_CODE}
            {...props}
        />
    );
}

export default ValidateCodeForm;
