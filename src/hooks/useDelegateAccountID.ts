import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {delegateEmailSelector} from '@selectors/Account';

import useOnyx from './useOnyx';
import {useAllPersonalDetails} from './usePersonalDetails';

const accountIDByLoginSelector = (lowerEmail: string | undefined) => (personalDetails: OnyxEntry<PersonalDetailsList>) => {
    if (!lowerEmail || !personalDetails) {
        return undefined;
    }
    for (const detail of Object.values(personalDetails)) {
        if (detail?.login?.toLowerCase() === lowerEmail) {
            return detail.accountID;
        }
    }
    return undefined;
};

function useDelegateAccountID(): number | undefined {
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const [accountID] = useAllPersonalDetails(accountIDByLoginSelector(delegateEmail?.toLowerCase()));

    return accountID;
}

export default useDelegateAccountID;
