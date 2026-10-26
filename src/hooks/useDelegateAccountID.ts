import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {delegateEmailSelector} from '@selectors/Account';
import {createOnyxSelector} from 'react-native-onyx';

import useOnyx from './useOnyx';
import {useAllPersonalDetails} from './usePersonalDetails';

// Shared across every instance of this hook; the email is an argument, not a closure, so it is part of the cache key.
const accountIDByLogin = createOnyxSelector((personalDetails: OnyxEntry<PersonalDetailsList>, lowerEmail: string | undefined) => {
    if (!lowerEmail || !personalDetails) {
        return undefined;
    }
    for (const detail of Object.values(personalDetails)) {
        if (detail?.login?.toLowerCase() === lowerEmail) {
            return detail.accountID;
        }
    }
    return undefined;
});

function useDelegateAccountID(): number | undefined {
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const lowerEmail = delegateEmail?.toLowerCase();
    const [accountID] = useAllPersonalDetails((personalDetails) => accountIDByLogin(personalDetails, lowerEmail));

    return accountID;
}

export default useDelegateAccountID;
