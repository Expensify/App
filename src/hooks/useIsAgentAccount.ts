import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxEntry} from 'react-native-onyx';

import {accountIDSelector} from '@selectors/Session';

import useOnyx from './useOnyx';

function useIsAgentAccount(): boolean | undefined {
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [personalDetail, personalDetailsMetadata] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: (personalDetails: OnyxEntry<PersonalDetailsList>) => {
            const detail = accountID ? personalDetails?.[accountID] : undefined;
            return detail ? {isCustomAgent: detail.isCustomAgent} : undefined;
        },
    });
    const [isLoadingApp, isLoadingAppMetadata] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [hasLoadedApp, hasLoadedAppMetadata] = useOnyx(ONYXKEYS.HAS_LOADED_APP);

    if (isLoadingOnyxValue(personalDetailsMetadata, isLoadingAppMetadata, hasLoadedAppMetadata)) {
        return undefined;
    }

    // Identity is unknown while a load is in flight AND we can't yet trust what we have. Two loads can leave us
    // without a trustworthy value:
    // - Cold start: HAS_LOADED_APP hasn't flipped true yet, so even though sign-in may have already merged a
    //   partial personal-details entry (login, name, ...), the isCustomAgent field itself is still in flight -
    //   its absence isn't meaningful yet.
    // - Delegate/account switch: personal details are wiped (unlike HAS_LOADED_APP, which Delegate's atomic reset
    //   deliberately preserves - see KEYS_TO_PRESERVE_DELEGATE_ACCESS), so a stale HAS_LOADED_APP=true must not be
    //   trusted while the entry is missing.
    // Once both HAS_LOADED_APP is true and a personal-details entry exists, a later OpenApp or ReconnectApp
    // setting IS_LOADING_APP back to true won't hide the screen again, because the identity we already have for
    // this account is still valid.
    if (isLoadingApp !== false && (!hasLoadedApp || personalDetail === undefined)) {
        return undefined;
    }

    return !!personalDetail?.isCustomAgent;
}

export default useIsAgentAccount;
