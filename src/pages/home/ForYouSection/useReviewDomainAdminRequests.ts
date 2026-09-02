import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {createPendingDomainAdminRequestsSelector} from '@src/selectors/Domain';
import {accountIDSelector} from '@src/selectors/Session';

type ReviewDomainAdminRequests = {
    /** Number of pending domain adminship requests awaiting review, used to decide whether to render the review row */
    count: number;

    /** Opens the domain admins page for the one domain with pending requests, or the domains list when there are several. */
    reviewDomainAdminRequests: () => void;
};

/** Handles the "Review X domain admin request(s)" row on the "For you" section of the home page. */
function useReviewDomainAdminRequests(): ReviewDomainAdminRequests {
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [pendingDomainAdminRequests] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN, {selector: createPendingDomainAdminRequestsSelector(accountID)});
    const count = pendingDomainAdminRequests?.count ?? 0;
    const domainAccountIDs = pendingDomainAdminRequests?.domainAccountIDs ?? [];

    const reviewDomainAdminRequests = () => {
        if (domainAccountIDs.length === 1) {
            Navigation.navigate(ROUTES.DOMAIN_ADMINS.getRoute(domainAccountIDs.at(0) ?? 0));
            return;
        }
        Navigation.navigate(ROUTES.DOMAINS_LIST.getRoute());
    };

    return {count, reviewDomainAdminRequests};
}

export default useReviewDomainAdminRequests;
