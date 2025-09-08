import {useMemo} from 'react';
import {useSession} from '@components/OnyxListItemProvider';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails} from '@src/types/onyx';
import useOnyx from './useOnyx';

function useCurrentUserPersonalDetails() {
    const session = useSession();
    const userAccountID = useMemo(() => session?.accountID ?? CONST.DEFAULT_NUMBER_ID, [session?.accountID]);
    const [userPersonalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: (allPersonalDetails) => allPersonalDetails?.[userAccountID], canBeMissing: true});

    const accountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    const currentUserPersonalDetails: PersonalDetails = useMemo(() => ({...userPersonalDetails, accountID}), [userPersonalDetails, accountID]);

    return currentUserPersonalDetails;
}

export default useCurrentUserPersonalDetails;
