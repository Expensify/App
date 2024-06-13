import {useMemo} from 'react';
import {usePersonalDetails, useSession} from '@components/OnyxProvider';
import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';

type CurrentUserPersonalDetails = PersonalDetails | Record<string, never>;

function useCurrentUserPersonalDetails() {
    const session = useSession();
    const personalDetails = usePersonalDetails() ?? CONST.EMPTY_OBJECT;
    const accountID = session?.accountID ?? -1;
    const accountPersonalDetails = personalDetails?.[accountID];
    const currentUserPersonalDetails: CurrentUserPersonalDetails = useMemo(
        () => (accountPersonalDetails ? {...accountPersonalDetails, accountID} : {}) as CurrentUserPersonalDetails,
        [accountPersonalDetails, accountID],
    );

    return currentUserPersonalDetails;
}

export default useCurrentUserPersonalDetails;
