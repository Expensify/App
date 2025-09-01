import {useMemo} from 'react';
import {usePersonalDetails, useSession} from '@components/OnyxListItemProvider';
import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';

function useCurrentUserPersonalDetails() {
    const session = useSession();
    const personalDetails = usePersonalDetails();
    const accountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    const accountPersonalDetails = personalDetails?.[accountID];
    const currentUserPersonalDetails: PersonalDetails = useMemo(() => ({...accountPersonalDetails, accountID}), [accountPersonalDetails, accountID]);

    return currentUserPersonalDetails;
}

export default useCurrentUserPersonalDetails;
