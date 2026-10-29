import {canCreateBill} from '@libs/BillPayUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Account} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

const isFromPublicDomainSelector = (account: OnyxEntry<Account>) => account?.isFromPublicDomain;

/** Returns whether the current user can create a bill from the Create menus. */
function useCanCreateBill(): boolean {
    const {login} = useCurrentUserPersonalDetails();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [domains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN);
    const [isFromPublicDomain] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isFromPublicDomainSelector});

    return canCreateBill(policies, domains, login, isFromPublicDomain);
}

export default useCanCreateBill;
