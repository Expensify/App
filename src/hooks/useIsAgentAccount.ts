import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxEntry} from 'react-native-onyx';

import {useCallback} from 'react';

import {useSession} from './OnyxListItemProvider';

function useIsAgentAccount(): boolean | undefined {
    const session = useSession();
    const accountID = session?.accountID;
    const isCustomAgentSelector = useCallback((personalDetails: OnyxEntry<PersonalDetailsList>) => (accountID ? personalDetails?.[accountID]?.isCustomAgent : undefined), [accountID]);
    const [isCustomAgent, personalDetailsMetadata] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: isCustomAgentSelector});
    const [isLoadingApp = true, isLoadingAppMetadata] = useOnyx(ONYXKEYS.IS_LOADING_APP);

    if (!accountID || isLoadingApp || isLoadingOnyxValue(personalDetailsMetadata, isLoadingAppMetadata)) {
        return undefined;
    }

    return !!isCustomAgent;
}

export default useIsAgentAccount;
