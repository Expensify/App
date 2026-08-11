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

    if (isLoadingApp === true || isLoadingOnyxValue(personalDetailsMetadata, isLoadingAppMetadata)) {
        return undefined;
    }

    return !!isCustomAgent;
}

export default useIsAgentAccount;
