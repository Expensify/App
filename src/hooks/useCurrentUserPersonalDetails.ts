import {useMemo} from 'react';
import {usePersonalDetails, useSession} from '@components/OnyxProvider';
import type {PersonalDetails} from '@src/types/onyx';

function useCurrentUserPersonalDetails() {
    const session = useSession();
    const personalDetails = usePersonalDetails();
    const accountID = session?.accountID;
    const accountPersonalDetails = personalDetails?.[accountID];
    const currentUserPersonalDetails: PersonalDetails = useMemo(() => ({...accountPersonalDetails, accountID}), [accountPersonalDetails, accountID]);

    return currentUserPersonalDetails;
}

export default useCurrentUserPersonalDetails;
