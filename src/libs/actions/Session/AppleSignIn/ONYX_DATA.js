import ONYXKEYS from '../../../../ONYXKEYS';
import CONST from '../../../../CONST';
import * as Localize from '../../../Localize';
import DateUtils from '../../../DateUtils';

const optimisticData = [
    {
        onyxMethod: CONST.ONYX.METHOD.MERGE,
        key: ONYXKEYS.ACCOUNT,
        value: {
            ...CONST.DEFAULT_ACCOUNT_DATA,
            isLoading: true,
        },
    },
];

const successData = [
    {
        onyxMethod: CONST.ONYX.METHOD.MERGE,
        key: ONYXKEYS.ACCOUNT,
        value: {
            isLoading: false,
        },
    },
    {
        onyxMethod: CONST.ONYX.METHOD.MERGE,
        key: ONYXKEYS.CREDENTIALS,
        value: {
            validateCode: null,
        },
    },
];

const failureData = [
    {
        onyxMethod: CONST.ONYX.METHOD.MERGE,
        key: ONYXKEYS.ACCOUNT,
        value: {
            isLoading: false,
            errors: {
                [DateUtils.getMicroseconds()]: Localize.translateLocal('loginForm.cannotGetAccountDetails'),
            },
        },
    },
];

export {
    optimisticData,
    successData,
    failureData,
};
