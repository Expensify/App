import React, {createContext, useCallback, useEffect, useRef} from 'react';
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
    const sessionRef = useRef(session);

    // Keep a ref of session to make the selector perfectly synchronized
    // with the current Onyx state during the same render phase.
    useEffect(() => {
        sessionRef.current = session;
    }, [session?.accountID]);

    const userAccountSelector = useCallback(
        (allPersonalDetails: OnyxEntry<PersonalDetailsList>): CurrentUserPersonalDetails => {
            const userAccountID = sessionRef.current?.accountID ?? CONST.DEFAULT_NUMBER_ID;
            return allPersonalDetails?.[userAccountID] as CurrentUserPersonalDetails;
        },
        [],
    );
    const [currentUserPersonalDetails = defaultCurrentUserPersonalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: userAccountSelector, canBeMissing: true}, [session?.accountID]);

    return <CurrentUserPersonalDetailsContext.Provider value={currentUserPersonalDetails}>{children}</CurrentUserPersonalDetailsContext.Provider>;
}

export {CurrentUserPersonalDetailsContext, CurrentUserPersonalDetailsProvider};
