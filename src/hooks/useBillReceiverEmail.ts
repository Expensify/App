import {getBillReceiverEmail} from '@libs/BillPayUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

/** Returns the technical contact of the current user's email domain, who receives the bills the user creates. */
function useBillReceiverEmail(): string | undefined {
    const {login} = useCurrentUserPersonalDetails();
    const [receiverEmail] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN, {selector: (domains) => getBillReceiverEmail(domains, login)});
    return receiverEmail;
}

export default useBillReceiverEmail;
