import CONST from '@src/CONST';
import type {TransactionViolations} from '@src/types/onyx';
import type {ReceiptErrors} from '@src/types/onyx/Transaction';

const RECEIPT_ERRORS_ID_R14932 = 1201421;
const RECEIPT_ERRORS_TRANSACTION_ID_R14932 = 'IOU_TRANSACTION_ID_R14932';

const violationsR14932: TransactionViolations = [
    {
        name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
        type: CONST.VIOLATION_TYPES.VIOLATION,
        showInReview: true,
    },
    {
        name: CONST.VIOLATIONS.MISSING_CATEGORY,
        type: CONST.VIOLATION_TYPES.VIOLATION,
        showInReview: true,
    },
    {
        name: CONST.VIOLATIONS.FIELD_REQUIRED,
        type: CONST.VIOLATION_TYPES.VIOLATION,
        showInReview: true,
    },
];

const receiptErrorsR14932: ReceiptErrors = {
    [RECEIPT_ERRORS_ID_R14932]: {
        source: CONST.POLICY.ID_FAKE,
        filename: CONST.POLICY.ID_FAKE,
        action: CONST.POLICY.ID_FAKE,
        retryParams: {
            transactionID: RECEIPT_ERRORS_TRANSACTION_ID_R14932,
            source: CONST.POLICY.ID_FAKE,
            transactionPolicy: undefined,
        },
    },
};

export {receiptErrorsR14932, violationsR14932};
