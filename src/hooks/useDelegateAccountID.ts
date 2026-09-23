import ONYXKEYS from '@src/ONYXKEYS';

import {delegateEmailSelector} from '@selectors/Account';

import useOnyx from './useOnyx';
import {useAllPersonalDetails} from './usePersonalDetails';

function useDelegateAccountID(): number | undefined {
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const lowerEmail = delegateEmail?.toLowerCase();

    const [accountID] = useAllPersonalDetails((personalDetails) => {
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

    return accountID;
}

export default useDelegateAccountID;
