import type {TransactionWithOptionalSearchFields} from '@components/TransactionItemRow';
import CONST from '@src/CONST';
import type Transaction from '@src/types/onyx/Transaction';

const transaction: Transaction & {mcc: string; modifiedMCC: string} = {
    amount: -769900,
    bank: '',
    billable: false,
    cardID: 0,
    cardName: 'Cash Expense',
    cardNumber: '',
    category: 'CARS',
    comment: {
        comment: '',
    },
    created: '2025-02-18',
    currency: 'PLN',
    hasEReceipt: false,
    inserted: '2025-02-18 14:23:29',
    managedCard: false,
    mcc: '',
    merchant: "Mario's",
    modifiedAmount: 0,
    modifiedCreated: '',
    modifiedCurrency: '',
    modifiedMCC: '',
    modifiedMerchant: '',
    originalAmount: 0,
    originalCurrency: '',
    parentTransactionID: '',
    posted: '',
    receipt: {},
    reimbursable: false,
    reportID: '0',
    status: 'Posted',
    tag: 'private',
    transactionID: '1564303948126109676',
};

const transactionWithOptionalSearchFields: TransactionWithOptionalSearchFields = {
    ...transaction,
    from: {
        accountID: 1,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_7.png',
        displayName: 'johnDoe@example.com User',
        login: 'johnDoe@example.com',
    },
    to: {
        accountID: 1,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_7.png',
        displayName: 'johnDoe@example.com User',
        login: 'johnDoe@example.com',
    },
    action: CONST.SEARCH.ACTION_TYPES.VIEW,
};

export default transaction;
export {transactionWithOptionalSearchFields};
