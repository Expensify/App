import type {BankAccountList} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

const bankAccountByIDSelector = (bankAccountID: string | number | undefined) => (bankAccountList: OnyxEntry<BankAccountList>) =>
    bankAccountID ? bankAccountList?.[bankAccountID] : undefined;

// eslint-disable-next-line import/prefer-default-export -- additional selectors may be added here
export {bankAccountByIDSelector};
