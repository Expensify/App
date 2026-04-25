import {delegateEmailSelector} from '@selectors/Account';
import {useCallback} from 'react';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';
import useOnyx from './useOnyx';

function useDelegateAccountID(): number | undefined {
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const normalizedEmail = delegateEmail?.toLowerCase();

    const selector = useCallback(
        (personalDetails: PersonalDetailsList | null | undefined): number | undefined => {
            if (!normalizedEmail || !personalDetails) {
                return undefined;
            }
            return Object.values(personalDetails).find((detail) => detail?.login?.toLowerCase() === normalizedEmail)?.accountID;
        },
        [normalizedEmail],
    );

    const [delegateAccountID] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector});

    return delegateAccountID;
}

export default useDelegateAccountID;
