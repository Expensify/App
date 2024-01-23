import Onyx from 'react-native-onyx';
import * as App from '@userActions/App';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxKey} from '@src/ONYXKEYS';

function useOnyxWipe() {
    const wipeOnyx = () => {
        const keysToPreserve: OnyxKey[] = [
            ONYXKEYS.ACCOUNT,
            ONYXKEYS.CURRENCY_LIST,
            ONYXKEYS.DEVICE_ID,
            ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER,
            ONYXKEYS.IS_LOADING_APP,
            ONYXKEYS.IS_SIDEBAR_LOADED,
            ONYXKEYS.LOGIN_LIST,
            ONYXKEYS.NVP_PRIORITY_MODE,
            ONYXKEYS.NVP_PREFERRED_LOCALE,
            ONYXKEYS.PREFERRED_THEME,
            ONYXKEYS.SESSION,
            ONYXKEYS.NVP_TRY_FOCUS_MODE,
            ONYXKEYS.USER,
            ONYXKEYS.USER_WALLET,
        ];

        Onyx.clear(keysToPreserve).then(() => {
            App.openApp();
        });
    };

    return wipeOnyx;
}

export default useOnyxWipe;
