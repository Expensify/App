import useOnyx from '@hooks/useOnyx';

import {getDomainsWithErrors} from '@libs/DomainUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import useReviewDomainAdminRequests from './useReviewDomainAdminRequests';

type DomainsTabBadge = {
    /** Badge text: number of domain rows needing attention (pending admin request or error), deduped. Undefined when none. */
    badgeText: string | undefined;

    /** Whether any marked row has an error, used to color the badge red instead of green. */
    hasDomainErrors: boolean;
};

/** Drives the Domains tab badge: counts the domain rows needing attention (a pending admin request or an error, deduped). */
function useDomainsTabBadge(): DomainsTabBadge {
    const {domainAccountIDs: pendingDomainAdminRequestAccountIDs} = useReviewDomainAdminRequests();
    const [allDomainErrors] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN_ERRORS);
    const [allDomains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN);
    const errorDomainAccountIDs = getDomainsWithErrors(allDomainErrors, allDomains).map(([key]) => Number(key.replace(ONYXKEYS.COLLECTION.DOMAIN_ERRORS, '')));

    const markedDomainAccountIDs = new Set([...pendingDomainAdminRequestAccountIDs, ...errorDomainAccountIDs]);
    const count = markedDomainAccountIDs.size;

    return {
        badgeText: count > 0 ? count.toString() : undefined,
        hasDomainErrors: errorDomainAccountIDs.length > 0,
    };
}

export default useDomainsTabBadge;
