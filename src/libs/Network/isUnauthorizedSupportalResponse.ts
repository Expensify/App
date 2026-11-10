import CONST from '@src/CONST';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import {isSupportAuthToken} from './NetworkStore';

const SUPPORTAL_DENIAL_MESSAGE = 'You are not authorized to take this action when support logged in.';

function isUnauthorizedSupportalResponse<TKey extends OnyxKey>(response: Response<TKey> | void): boolean {
    return (
        isSupportAuthToken() && response?.jsonCode === CONST.JSON_CODE.SUPPORT_NOT_AUTHORIZED && typeof response.message === 'string' && response.message.includes(SUPPORTAL_DENIAL_MESSAGE)
    );
}

export default isUnauthorizedSupportalResponse;
export {SUPPORTAL_DENIAL_MESSAGE};
