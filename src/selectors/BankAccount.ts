import type {BankAccountList} from '@src/types/onyx/BankAccount';

import type {OnyxEntry} from 'react-native-onyx';

/**
 * Maps each bank account ID to its `accountData.state`.
 */
const bankAccountStatesSelector = (bankAccountList: OnyxEntry<BankAccountList>): Record<string, string | undefined> => {
    const states: Record<string, string | undefined> = {};
    for (const [bankAccountID, bankAccount] of Object.entries(bankAccountList ?? {})) {
        states[bankAccountID] = bankAccount?.accountData?.state;
    }
    return states;
};

// eslint-disable-next-line import/prefer-default-export
export {bankAccountStatesSelector};
