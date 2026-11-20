/**
 * Finds the Digits account that company card transactions export to. While the admin hasn't picked one, the exporter
 * uses the first active credit card account, so the export settings show that same account.
 */
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {DigitsAccount} from '@src/types/onyx/Policy';

import type {OnyxEntry} from 'react-native-onyx';

function getDigitsCompanyCardAccount(policy: OnyxEntry<Policy>): DigitsAccount | undefined {
    const accounts = policy?.connections?.digits?.data?.accounts ?? [];
    const creditCardAccountID = policy?.connections?.digits?.config?.export?.creditCardAccountID;
    if (creditCardAccountID) {
        return accounts.find((account) => account.id === creditCardAccountID);
    }
    return accounts.find((account) => account.isActive && account.subtype === CONST.DIGITS_ACCOUNT_SUBTYPE.CREDIT_CARDS);
}

export default getDigitsCompanyCardAccount;
