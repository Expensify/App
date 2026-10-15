import ONYXKEYS from '@src/ONYXKEYS';
import {createIsAdminOfDomainSelector} from '@src/selectors/Domain';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

/** Whether the current user is an admin of the given domain. Always false when there is no domain (e.g. workspace feeds). */
export default function useIsDomainAdmin(domainID: number | undefined): boolean {
    const {accountID} = useCurrentUserPersonalDetails();
    const [isDomainAdmin = false] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN, {selector: createIsAdminOfDomainSelector(domainID, accountID)});
    return isDomainAdmin;
}
