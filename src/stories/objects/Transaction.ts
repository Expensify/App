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
    filename: '',
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

export default transaction;
