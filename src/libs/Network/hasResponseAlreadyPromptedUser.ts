import CONST from '@src/CONST';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import isUnauthorizedSupportalResponse from './isUnauthorizedSupportalResponse';

// None of the prompting modules leave a mark on the response, so each branch below names the one that owns the prompt.
function hasResponseAlreadyPromptedUser<TKey extends OnyxKey>(response: Response<TKey> | void): boolean {
    const jsonCode = response?.jsonCode;

    // A middleware consumed the response instead of passing it on, the way handleDeletedAccount does when it signs the user out.
    if (!jsonCode) {
        return true;
    }

    // HttpUtils.alertUser shows the update prompt, and Reauthentication surfaces the retry failure.
    if (jsonCode === CONST.JSON_CODE.UPDATE_REQUIRED || jsonCode === CONST.JSON_CODE.UNABLE_TO_RETRY) {
        return true;
    }

    // SupportalPermission shows the supportal denial.
    return isUnauthorizedSupportalResponse(response);
}

export default hasResponseAlreadyPromptedUser;
