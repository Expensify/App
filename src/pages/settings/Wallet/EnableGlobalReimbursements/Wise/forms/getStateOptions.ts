import type {DynamicFormFieldOption} from '@src/types/onyx';

import {CONST as COMMON_CONST} from 'expensify-common';

type StateCode = keyof typeof COMMON_CONST.STATES;

function isStateCode(code: string): code is StateCode {
    return code in COMMON_CONST.STATES;
}

/** US states as options keyed by their code, so a row holding a code shows the state's name */
function getStateOptions(): DynamicFormFieldOption[] {
    return Object.keys(COMMON_CONST.STATES)
        .filter(isStateCode)
        .map((code) => ({key: code, labelKey: `allStates.${code}.stateName`}));
}

export default getStateOptions;
