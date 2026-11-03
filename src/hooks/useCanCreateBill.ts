import {isBillCreatorPolicyAdmin} from '@libs/BillPayUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Account} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useBillReceiverEmail from './useBillReceiverEmail';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

const isFromPublicDomainSelector = (account: OnyxEntry<Account>) => account?.isFromPublicDomain;

/** Returns whether the current user can create a bill from the Create menus. */
function useCanCreateBill(): boolean {
    const {login} = useCurrentUserPersonalDetails();
    const [isPolicyAdmin = false] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: (policies) => isBillCreatorPolicyAdmin(policies, login)});
    const receiverEmail = useBillReceiverEmail();
    const [isFromPublicDomain] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isFromPublicDomainSelector});

    // Classic sends a bill to the technical contact of the creator's own domain, which public domains don't have
    return !isFromPublicDomain && isPolicyAdmin && !!receiverEmail;
}

export default useCanCreateBill;
