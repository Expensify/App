import React, {createContext, useCallback} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import {useSession} from './OnyxListItemProvider';

const defaultCurrentUserPersonalDetails: CurrentUserPersonalDetails = {
    accountID: CONST.DEFAULT_NUMBER_ID,
};

const CurrentUserPersonalDetailsContext = createContext<CurrentUserPersonalDetails>(defaultCurrentUserPersonalDetails);

function CurrentUserPersonalDetailsProvider({children}: {children: React.ReactNode}) {
    const session = useSession();
    const userAccountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    const userAccountSelector = useCallback(
        (allPersonalDetails: OnyxEntry<PersonalDetailsList>): CurrentUserPersonalDetails => {
            const personalDetailsForUser = (allPersonalDetails?.[userAccountID] ?? {}) as CurrentUserPersonalDetails;
            personalDetailsForUser.accountID = userAccountID;
            personalDetailsForUser.email = session?.email;
            return personalDetailsForUser;
        },
        [session?.email, userAccountID],
    );
    const [currentUserPersonalDetails = defaultCurrentUserPersonalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: userAccountSelector, canBeMissing: true});

    return <CurrentUserPersonalDetailsContext.Provider value={currentUserPersonalDetails}>{children}</CurrentUserPersonalDetailsContext.Provider>;
}

export {CurrentUserPersonalDetailsContext, CurrentUserPersonalDetailsProvider};
