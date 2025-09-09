import React, {createContext, useMemo} from 'react';
import useOnyx from '@hooks/useOnyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails} from '@src/types/onyx';
import {useSession} from './OnyxListItemProvider';

const CurrentUserPersonalDetailsContext = createContext<PersonalDetails | undefined>(undefined);

function CurrentUserPersonalDetailsProvider({children}: {children: React.ReactNode}) {
    const session = useSession();
    const userAccountID = useMemo(() => session?.accountID ?? CONST.DEFAULT_NUMBER_ID, [session?.accountID]);
    const [userPersonalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: (allPersonalDetails) => allPersonalDetails?.[userAccountID], canBeMissing: true});

    const accountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    const currentUserPersonalDetails: PersonalDetails = useMemo(() => ({...userPersonalDetails, accountID}), [userPersonalDetails, accountID]);

    return <CurrentUserPersonalDetailsContext.Provider value={currentUserPersonalDetails}>{children}</CurrentUserPersonalDetailsContext.Provider>;
}

export {CurrentUserPersonalDetailsContext, CurrentUserPersonalDetailsProvider};
