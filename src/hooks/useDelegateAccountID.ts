import {delegateEmailSelector} from '@selectors/Account';
import type {OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';
import useOnyx from './useOnyx';

function useDelegateAccountID(): number | undefined {
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const lowerEmail = delegateEmail?.toLowerCase();

    const [accountID] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: (personalDetails: OnyxEntry<PersonalDetailsList>) => {
            if (!lowerEmail || !personalDetails) {
                return undefined;
            }
            for (const detail of Object.values(personalDetails)) {
                if (detail?.login?.toLowerCase() === lowerEmail) {
                    return detail.accountID;
                }
            }
            return undefined;
        },
    });

    return accountID;
}

export default useDelegateAccountID;
