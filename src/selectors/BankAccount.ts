import type {BankAccountList} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

/**
 * Returns a selector that picks the methodID of the bank account connected to the given workspace.
 */
const connectedBankAccountIDSelector = (policyID: string | undefined) => (bankAccountList: OnyxEntry<BankAccountList>) =>
    Object.values(bankAccountList ?? {}).find((bankAccount) => bankAccount?.accountData?.additionalData?.policyID === policyID)?.methodID;

// eslint-disable-next-line import/prefer-default-export -- additional selectors may be added here
export {connectedBankAccountIDSelector};
