import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {useCallback} from 'react';

import useOnyx from './useOnyx';

/**
 * Returns whether international deposit details (IBAN/SWIFT) should be collected when adding a bank account in the
 * given country. This is the case when any of the user's policies can reimburse from a country other than the one
 * the bank account is being added in.
 */
function useShouldCollectInternationalDepositDetails(bankCountry: string): boolean {
    const selector = useCallback(
        (policies: OnyxCollection<Policy>) =>
            Object.values(policies ?? {}).some((policy) => {
                const countries = Object.keys(policy?.reimbursement?.countries ?? {});
                return countries.length > 0 && !countries.includes(bankCountry);
            }),
        [bankCountry],
    );
    const [shouldCollectInternationalDepositDetails] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector});
    return shouldCollectInternationalDepositDetails ?? false;
}

export default useShouldCollectInternationalDepositDetails;
