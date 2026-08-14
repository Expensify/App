import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxEntry} from 'react-native-onyx';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

function useIsAgentAccount(): boolean | undefined {
    const accountID = useCurrentUserPersonalDetails().accountID;
    const [isCustomAgent, personalDetailsMetadata] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: (personalDetails: OnyxEntry<PersonalDetailsList>) => (accountID ? personalDetails?.[accountID]?.isCustomAgent : undefined),
    });
    const [isLoadingApp, isLoadingAppMetadata] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [hasLoadedApp, hasLoadedAppMetadata] = useOnyx(ONYXKEYS.HAS_LOADED_APP);

    if (isLoadingOnyxValue(personalDetailsMetadata, isLoadingAppMetadata, hasLoadedAppMetadata)) {
        return undefined;
    }

    // Agent identity lives in this account's personal details, so it is only genuinely unknown until the first
    // OpenApp for the account has completed. HAS_LOADED_APP records exactly that and is reset on an account
    // switch, whereas IS_LOADING_APP is optimistically set to `true` by *every* OpenApp. That includes ones that
    // fire mid-session, long after identity is known. Gating on IS_LOADING_APP alone therefore makes consumers
    // un-render an already-visible screen for the whole length of any such request.
    if (!hasLoadedApp && isLoadingApp !== false) {
        return undefined;
    }

    return !!isCustomAgent;
}

export default useIsAgentAccount;
