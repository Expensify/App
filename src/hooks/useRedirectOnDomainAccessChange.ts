import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import {domainAccessSelector} from '@src/selectors/Domain';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useState} from 'react';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

type DomainAccessRedirects = {
    /**
     * Route to open once the RHP is dismissed when a domain that had loaded is taken away, e.g. an admin denied the user's adminship
     * request. The whole RHP goes because screens deeper in the flow leave the earlier ones stale underneath. Replacing only the top
     * screen would let going back land on a stale one and redirect again. A domain that was never there is left alone, so deep links
     * to unknown domains still show not found.
     */
    whenAccessLost?: Route;

    /**
     * Dismisses the RHP, leaving the user on the domains list, when they are, or become, an admin of the domain, e.g. their adminship
     * request was approved. The domain is listed there for them now, and dismissing keeps the RHP screen out of browser history.
     */
    shouldDismissWhenAdmin?: boolean;
};

/**
 * Non-admin domain screens only make sense while the user's access stays the same. A requester sees the domain only while their
 * adminship request is open, so a denial takes it away mid-visit and an approval turns them into an admin. Both happen through
 * server updates while the screen is open, so we move the user along instead of leaving a stale or not found page on screen.
 *
 * @returns whether the screen is about to be replaced, so the caller can hide its content in the meantime
 */
function useRedirectOnDomainAccessChange(domainAccountID: number, {whenAccessLost, shouldDismissWhenAdmin}: DomainAccessRedirects): boolean {
    const isFocused = useIsFocused();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [domainAccess] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: domainAccessSelector(currentUserAccountID)});
    const domainName = domainAccess?.domainName;
    const isAdmin = !!domainAccess?.isAdmin;

    // Keyed by domain so a screen that swaps to another domain doesn't inherit the previous one's loaded name.
    const [loadedDomainAccountID, setLoadedDomainAccountID] = useState<number>();
    if (!!domainName && loadedDomainAccountID !== domainAccountID) {
        setLoadedDomainAccountID(domainAccountID);
    }
    const hasLostDomainAccess = !!whenAccessLost && loadedDomainAccountID === domainAccountID && !domainName;
    const shouldRedirectAdmin = !!shouldDismissWhenAdmin && isAdmin;

    useEffect(() => {
        // Wait for focus so a change landing while the user is deeper in the flow doesn't pull them out of it.
        if (!isFocused) {
            return;
        }
        if (shouldRedirectAdmin) {
            Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.dismissModal());
            return;
        }
        if (hasLostDomainAccess) {
            Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.dismissModal({afterTransition: () => Navigation.navigate(whenAccessLost)}));
        }
    }, [isFocused, shouldRedirectAdmin, hasLostDomainAccess, whenAccessLost]);

    return shouldRedirectAdmin || hasLostDomainAccess;
}

export default useRedirectOnDomainAccessChange;
