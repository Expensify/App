import React, {createContext, useCallback} from 'react';
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
    const userAccountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    const userAccountSelector = useCallback(
        (allPersonalDetails: OnyxEntry<PersonalDetailsList>): PersonalDetails => {
            const personalDetailsForUser = allPersonalDetails?.[userAccountID] ?? ({} as PersonalDetails);
            personalDetailsForUser.accountID = userAccountID;
            return personalDetailsForUser;
        },
        [userAccountID],
    );
    const [currentUserPersonalDetails = defaultCurrentUserPersonalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: userAccountSelector, canBeMissing: true});

    return <CurrentUserPersonalDetailsContext.Provider value={currentUserPersonalDetails}>{children}</CurrentUserPersonalDetailsContext.Provider>;
}

export {CurrentUserPersonalDetailsContext, CurrentUserPersonalDetailsProvider};
