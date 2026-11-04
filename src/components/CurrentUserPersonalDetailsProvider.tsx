import {usePersonalDetail} from '@hooks/usePersonalDetails';

import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

import React, {createContext} from 'react';

import {useSession} from './OnyxListItemProvider';

const defaultCurrentUserPersonalDetails: CurrentUserPersonalDetails = {
    accountID: CONST.DEFAULT_NUMBER_ID,
};

const CurrentUserPersonalDetailsContext = createContext<CurrentUserPersonalDetails>(defaultCurrentUserPersonalDetails);

function CurrentUserPersonalDetailsProvider({children}: {children: React.ReactNode}) {
    const session = useSession();
    const userAccountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    const userAccountSelector = (personalDetail: PersonalDetails | undefined): CurrentUserPersonalDetails => ({
        ...personalDetail,
        accountID: userAccountID,
        email: session?.email,
    });
    const [currentUserPersonalDetails = defaultCurrentUserPersonalDetails] = usePersonalDetail(userAccountID, userAccountSelector);

    return <CurrentUserPersonalDetailsContext.Provider value={currentUserPersonalDetails}>{children}</CurrentUserPersonalDetailsContext.Provider>;
}

export {CurrentUserPersonalDetailsContext, CurrentUserPersonalDetailsProvider};
