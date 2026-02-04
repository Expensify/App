import React, {createContext, useMemo} from 'react';
import useOnyx from '@hooks/useOnyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import {useSession} from './OnyxListItemProvider';

const defaultCurrentUserPersonalDetails: CurrentUserPersonalDetails = {
    accountID: CONST.DEFAULT_NUMBER_ID,
};

const CurrentUserPersonalDetailsContext = createContext<CurrentUserPersonalDetails>(defaultCurrentUserPersonalDetails);

function CurrentUserPersonalDetailsProvider({children}: {children: React.ReactNode}) {
    const session = useSession();
    const accountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    const [personalDetailsList] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const currentUserPersonalDetails = useMemo(() => {
        return personalDetailsList?.[accountID] ?? defaultCurrentUserPersonalDetails;
    }, [personalDetailsList, accountID]);

    return <CurrentUserPersonalDetailsContext.Provider value={currentUserPersonalDetails}>{children}</CurrentUserPersonalDetailsContext.Provider>;
}

export {CurrentUserPersonalDetailsContext, CurrentUserPersonalDetailsProvider};
