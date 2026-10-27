import {searchUserInServer} from '@libs/actions/Report';
import {addSMSDomainIfPhoneNumber} from '@libs/PhoneNumber';

import type {PersonalDetails} from '@src/types/onyx';

import {Str} from 'expensify-common';
import {useEffect} from 'react';

import useNetwork from './useNetwork';
import usePersonalDetailByLogin from './usePersonalDetailByLogin';

/**
 * Returns the personal details of a vacation delegate, asking the server for them when they are missing.
 *
 * A cache clear keeps the delegate login in `account.vacationDelegate` but drops its personal details, so the
 * delegate is left without an account ID, an avatar or a display name and renders as a bare login next to a
 * fallback avatar. Nothing else asks the server for those details again, so this hook does.
 *
 * Phone delegates from the invite path are stored as raw E.164 (`+919789942470`) while `SearchForUsers` and
 * `PersonalDetailsByLoginProvider` key registered accounts by the canonical SMS login. Subscribe to both so
 * the fetched record can actually hydrate this hook.
 */
function useVacationDelegatePersonalDetails(delegate: string | undefined): PersonalDetails | undefined {
    const login = delegate?.toLowerCase();
    const smsLogin = login ? addSMSDomainIfPhoneNumber(login).toLowerCase() : undefined;
    const personalDetailsByLogin = usePersonalDetailByLogin(login);
    const personalDetailsBySmsLogin = usePersonalDetailByLogin(smsLogin !== login ? smsLogin : undefined);
    const personalDetails = personalDetailsByLogin ?? personalDetailsBySmsLogin;
    const hasPersonalDetails = !!personalDetails;
    const {isOffline} = useNetwork();

    // `searchUserInServer` is a no-op while offline, hence the `isOffline` dependency: without it a hook that
    // mounts offline would never look the delegate up again once the connection comes back.
    useEffect(() => {
        if (!login || hasPersonalDetails || isOffline) {
            return;
        }
        searchUserInServer(Str.removeSMSDomain(login));
    }, [login, hasPersonalDetails, isOffline]);

    return personalDetails;
}

export default useVacationDelegatePersonalDetails;
