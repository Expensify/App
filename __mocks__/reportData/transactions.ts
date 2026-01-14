import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

const amount = 10402;
const currency = CONST.CURRENCY.USD;
const REPORT_ID_R14932 = 'REPORT_ID_R14932';
const TRANSACTION_ID_R14932 = 'TRANSACTION_ID_R14932';
const REPORT_ID_R98765 = 'REPORT_ID_R98765';
const TRANSACTION_ID_R98765 = 'TRANSACTION_ID_R98765';

const receiptR14932 = {
    state: CONST.IOU.RECEIPT_STATE.OPEN,
    source: 'mockData/eReceiptBGs/eReceiptBG_pink.png',
    filename: 'test.html',
};

const transactionR14932: Transaction = {
    amount,
    currency,
    cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
    transactionID: TRANSACTION_ID_R14932,
    reportID: REPORT_ID_R14932,
    status: CONST.TRANSACTION.STATUS.POSTED,
    receipt: receiptR14932,
    merchant: 'Acme',
    created: '2025-02-14',
    inserted: '2025-02-14 08:12:19',
    billable: false,
    managedCard: false,
    reimbursable: true,
    hasEReceipt: true,
    cardID: 0,
    modifiedAmount: 0,
    originalAmount: 0,
    comment: {},
    bank: '',
    cardNumber: '',
    category: '',
    modifiedCreated: '',
    modifiedCurrency: '',
    modifiedMerchant: '',
    originalCurrency: '',
    parentTransactionID: '',
    posted: '',
    tag: '',
};

const transactionR98765: Transaction = {
    currency,
    amount,
    transactionID: TRANSACTION_ID_R98765,
    reportID: REPORT_ID_R98765,
    status: CONST.TRANSACTION.STATUS.POSTED,
    cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
    created: '2025-02-14',
    inserted: '2025-02-14 08:12:19',
    merchant: 'Acme',
    reimbursable: true,
    hasEReceipt: true,
    managedCard: false,
    billable: false,
    modifiedAmount: 0,
    cardID: 0,
    originalAmount: 0,
    comment: {},
    bank: '',
    cardNumber: '',
    category: '',
    modifiedCreated: '',
    modifiedCurrency: '',
    modifiedMerchant: '',
    originalCurrency: '',
    parentTransactionID: '',
    posted: '',
    tag: '',
};

export {transactionR14932, transactionR98765};
