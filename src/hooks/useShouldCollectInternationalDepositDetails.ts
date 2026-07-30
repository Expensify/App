import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import useOnyx from './useOnyx';

/**
 * Returns whether international deposit details (IBAN/SWIFT) should be collected when adding a bank account in the
 * given country. This is the case when any of the user's policies can reimburse from a country other than the one
 * the bank account is being added in.
 *
 * The reimbursement countries this relies on are not part of the policy summary; they are fetched via
 * useLoadDepositAccountSetup at the entry of the bank account setup flow, which also gates rendering until they load.
 */
function useShouldCollectInternationalDepositDetails(bankCountry: string): boolean {
    const selector = (policies: OnyxCollection<Policy>) =>
        Object.values(policies ?? {}).some((policy) => {
            if (!policy?.reimbursement?.enabled) {
                return false;
            }
            const countries = Object.keys(policy.reimbursement.countries ?? {});
            return countries.length > 0 && !countries.includes(bankCountry);
        });
    const [shouldCollectInternationalDepositDetails] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector});
    return !!shouldCollectInternationalDepositDetails;
}

export default useShouldCollectInternationalDepositDetails;
