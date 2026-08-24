import {searchUserInServer} from '@libs/actions/Report';

import type {PersonalDetails} from '@src/types/onyx';

import {Str} from 'expensify-common';
import {useEffect} from 'react';

import usePersonalDetailByLogin from './usePersonalDetailByLogin';

/**
 * Returns the personal details of a vacation delegate, asking the server for them when they are missing.
 *
 * A cache clear keeps the delegate login in `account.vacationDelegate` but drops its personal details, so the
 * delegate is left without an account ID, an avatar or a display name and renders as a bare login next to a
 * fallback avatar. Nothing else asks the server for those details again, so this hook does.
 */
function useVacationDelegatePersonalDetails(delegate: string | undefined): PersonalDetails | undefined {
    const login = delegate?.toLowerCase();
    const personalDetails = usePersonalDetailByLogin(login);
    const hasPersonalDetails = !!personalDetails;

    useEffect(() => {
        if (!login || hasPersonalDetails) {
            return;
        }
        searchUserInServer(Str.removeSMSDomain(login));
    }, [login, hasPersonalDetails]);

    return personalDetails;
}

export default useVacationDelegatePersonalDetails;
