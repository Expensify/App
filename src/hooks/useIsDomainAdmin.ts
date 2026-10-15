import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isAdminSelector} from '@src/selectors/Domain';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

/**
 * Whether the current user is an admin of the given domain. Always false when there is no domain (e.g. workspace feeds).
 * Falls back to the `DEFAULT_NUMBER_ID` key when there is no domainID (same pattern as `usePaymentOptions`), which never holds a domain.
 */
export default function useIsDomainAdmin(domainID: number | undefined): boolean {
    const {accountID} = useCurrentUserPersonalDetails();
    // Hooks can't be conditional; DEFAULT_NUMBER_ID keeps the key valid (never `domain_undefined`) and never matches a real domain.
    // eslint-disable-next-line rulesdir/no-default-id-values
    const [isDomainAdmin = false] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainID ?? CONST.DEFAULT_NUMBER_ID}`, {selector: isAdminSelector(accountID)});
    return isDomainAdmin && !!domainID;
}
