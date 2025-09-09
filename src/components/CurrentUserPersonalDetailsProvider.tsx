import React, {createContext, useCallback, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, PersonalDetailsList} from '@src/types/onyx';
import {useSession} from './OnyxListItemProvider';

const defaultCurrentUserPersonalDetails: PersonalDetails = {
    accountID: CONST.DEFAULT_NUMBER_ID,
};

const CurrentUserPersonalDetailsContext = createContext<PersonalDetails>(defaultCurrentUserPersonalDetails);

function CurrentUserPersonalDetailsProvider({children}: {children: React.ReactNode}) {
    const session = useSession();
    const userAccountID = useMemo(() => session?.accountID ?? CONST.DEFAULT_NUMBER_ID, [session?.accountID]);
    const userAccountSelector = useCallback((allPersonalDetails: OnyxEntry<PersonalDetailsList>) => allPersonalDetails?.[userAccountID], [userAccountID]);
    const [userPersonalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: userAccountSelector, canBeMissing: true});

    const accountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    const currentUserPersonalDetails: PersonalDetails = useMemo(() => ({...userPersonalDetails, accountID}), [userPersonalDetails, accountID]);

    return <CurrentUserPersonalDetailsContext.Provider value={currentUserPersonalDetails}>{children}</CurrentUserPersonalDetailsContext.Provider>;
}

export {CurrentUserPersonalDetailsContext, CurrentUserPersonalDetailsProvider};
