import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import {domainNameSelector} from '@src/selectors/Domain';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useState} from 'react';

import useOnyx from './useOnyx';

/**
 * A requester only sees a domain while their adminship request is open, so an admin denying it takes the domain away mid-visit.
 * Once the domain name has loaded and then disappears, replaces the focused screen with `redirectTo` instead of leaving the user
 * on a not found page. A domain that was never there is left alone, so deep links to unknown domains still show not found.
 *
 * @returns whether the domain was taken away and the screen is about to be replaced, so the caller can hide its content
 */
function useRedirectOnDomainAccessLost(domainAccountID: number, redirectTo: Route | undefined): boolean {
    const isFocused = useIsFocused();
    const [domainName] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: domainNameSelector});

    // Keyed by domain so a screen that swaps to another domain doesn't inherit the previous one's loaded name.
    const [loadedDomainAccountID, setLoadedDomainAccountID] = useState<number>();
    if (!!domainName && loadedDomainAccountID !== domainAccountID) {
        setLoadedDomainAccountID(domainAccountID);
    }
    const hasLostDomainAccess = !!redirectTo && loadedDomainAccountID === domainAccountID && !domainName;

    useEffect(() => {
        // Wait for focus so a denial landing while the user is deeper in the flow doesn't pull them out of it.
        if (!hasLostDomainAccess || !isFocused) {
            return;
        }
        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.navigate(redirectTo, {forceReplace: true}));
    }, [hasLostDomainAccess, isFocused, redirectTo]);

    return hasLostDomainAccess;
}

export default useRedirectOnDomainAccessLost;
