import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxEntry} from 'react-native-onyx';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

function useIsAgentAccount(): boolean | undefined {
    const accountID = useCurrentUserPersonalDetails().accountID;
    const [personalDetail, personalDetailsMetadata] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: (personalDetails: OnyxEntry<PersonalDetailsList>) => (accountID ? personalDetails?.[accountID] : undefined),
    });
    const [isLoadingApp, isLoadingAppMetadata] = useOnyx(ONYXKEYS.IS_LOADING_APP);

    if (isLoadingOnyxValue(personalDetailsMetadata, isLoadingAppMetadata)) {
        return undefined;
    }

    // We only know the agent identity once this account has a personal details entry. If that entry is missing
    // and a load is still in flight, treat the identity as unknown. Personal details always get cleared on an
    // account switch, even a delegate switch, so this stays accurate no matter which account is active. Once the
    // entry exists, a later OpenApp or ReconnectApp setting IS_LOADING_APP back to true won't hide the screen
    // again, because the identity we already have is still valid.
    if (personalDetail === undefined && isLoadingApp !== false) {
        return undefined;
    }

    return !!personalDetail?.isCustomAgent;
}

export default useIsAgentAccount;
