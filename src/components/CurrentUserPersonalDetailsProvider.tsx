import {createUserAccountSelector} from '@selectors/PersonalDetails';
import React, {createContext, useMemo} from 'react';
import useOnyx from '@hooks/useOnyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails} from '@src/types/onyx';
import {useSession} from './OnyxListItemProvider';

const defaultCurrentUserPersonalDetails: PersonalDetails = {
    accountID: CONST.DEFAULT_NUMBER_ID,
};

const CurrentUserPersonalDetailsContext = createContext<PersonalDetails>(defaultCurrentUserPersonalDetails);

function CurrentUserPersonalDetailsProvider({children}: {children: React.ReactNode}) {
    const session = useSession();
    const userAccountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    const userAccountSelector = useMemo(() => createUserAccountSelector(userAccountID), [userAccountID]);
    const [currentUserPersonalDetails = defaultCurrentUserPersonalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: userAccountSelector, canBeMissing: true});

    return <CurrentUserPersonalDetailsContext.Provider value={currentUserPersonalDetails}>{children}</CurrentUserPersonalDetailsContext.Provider>;
}

export {CurrentUserPersonalDetailsContext, CurrentUserPersonalDetailsProvider};
