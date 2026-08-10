import type {PersonalDetailsByLogin} from '@components/PersonalDetailsByLoginProvider';
import {EMPTY_PERSONAL_DETAILS_BY_LOGIN, PersonalDetailsByLoginContext} from '@components/PersonalDetailsByLoginProvider';

import type {PersonalDetails} from '@src/types/onyx';

import {useContext, useRef, useSyncExternalStore} from 'react';

/**
 * Maps the personal details the hook subscribes to onto the value the consumer actually needs.
 *
 * It runs on every store read, and `useSyncExternalStore` re-renders as soon as a read returns a new
 * reference, so it must return a primitive or a reference that is already stable (e.g. a field of the
 * personal details), never a freshly built object or array.
 */
type Selector<TInput, TReturn> = (input: TInput) => TReturn;

function haveSameDetails(first: PersonalDetailsByLogin, second: PersonalDetailsByLogin): boolean {
    const firstLogins = Object.keys(first);
    if (firstLogins.length !== Object.keys(second).length) {
        return false;
    }
    return firstLogins.every((login) => first[login] === second[login]);
}

/**
 * Returns the personal details of a single login, or `undefined` when there are none for it.
 *
 * Pass a `selector` to narrow the personal details down to the part the consumer needs, so that it only
 * re-renders when that part changes.
 *
 * Only re-renders when the personal details of that login change, not when anything else in the personal
 * details list does.
 */
function usePersonalDetailByLogin(login: string | undefined): PersonalDetails | undefined;
function usePersonalDetailByLogin<TReturn>(login: string | undefined, selector: Selector<PersonalDetails | undefined, TReturn>): TReturn;
function usePersonalDetailByLogin<TReturn>(login: string | undefined, selector?: Selector<PersonalDetails | undefined, TReturn>) {
    const {subscribe, getSnapshot} = useContext(PersonalDetailsByLoginContext);

    const getPersonalDetail = () => {
        const personalDetails = login ? getSnapshot()[login] : undefined;
        return selector ? selector(personalDetails) : personalDetails;
    };

    return useSyncExternalStore(subscribe, getPersonalDetail, getPersonalDetail);
}

/**
 * Returns the personal details of the given logins, keyed by login. Logins without personal details are left out.
 *
 * Pass a `selector` to narrow those personal details down to the part the consumer needs, so that it only
 * re-renders when that part changes.
 *
 * Only re-renders when the personal details of those logins change, not when anything else in the personal
 * details list does.
 */
function usePersonalDetailsByLogins(logins: Array<string | undefined>): PersonalDetailsByLogin;
function usePersonalDetailsByLogins<TReturn>(logins: Array<string | undefined>, selector: Selector<PersonalDetailsByLogin, TReturn>): TReturn;
function usePersonalDetailsByLogins<TReturn>(logins: Array<string | undefined>, selector?: Selector<PersonalDetailsByLogin, TReturn>) {
    const {subscribe, getSnapshot} = useContext(PersonalDetailsByLoginContext);
    const selectedPersonalDetailsRef = useRef<PersonalDetailsByLogin>(EMPTY_PERSONAL_DETAILS_BY_LOGIN);

    const getSelectedPersonalDetails = () => {
        const personalDetailsByLogin = getSnapshot();
        const selectedPersonalDetails: PersonalDetailsByLogin = {};
        for (const login of logins) {
            const personalDetails = login ? personalDetailsByLogin[login] : undefined;
            if (!login || !personalDetails) {
                continue;
            }
            selectedPersonalDetails[login] = personalDetails;
        }

        // useSyncExternalStore re-renders as soon as this returns a new reference, so keep handing back the
        // previous object for as long as it holds the exact same personal details.
        if (!haveSameDetails(selectedPersonalDetailsRef.current, selectedPersonalDetails)) {
            selectedPersonalDetailsRef.current = selectedPersonalDetails;
        }
        return selector ? selector(selectedPersonalDetailsRef.current) : selectedPersonalDetailsRef.current;
    };

    return useSyncExternalStore(subscribe, getSelectedPersonalDetails, getSelectedPersonalDetails);
}

export default usePersonalDetailByLogin;
export {usePersonalDetailsByLogins};
