import PropTypes from 'prop-types';


/**
 * Names of the Transaction Violations.
 * Defined as an array so it can be used in `PropTypes.oneOf`
 */
const violationNames = [
    'allTagLevelsRequired',
    'autoReportedRejectedExpense',
    'billableExpense',
    'cashExpenseWithNoReceipt',
    'categoryOutOfPolicy',
    'conversionSurcharge',
    'customUnitOutOfPolicy',
    'duplicatedTransaction',
    'fieldRequired',
    'futureDate',
    'invoiceMarkup',
    'maxAge',
    'missingCategory',
    'missingComment',
    'missingTag',
    'modifiedAmount',
    'modifiedDate',
    'nonExpensiworksExpense',
    'overAutoApprovalLimit',
    'overCategoryLimit',
    'overLimit',
    'overLimitAttendee',
    'perDayLimit',
    'receiptNotSmartScanned',
    'receiptRequired',
    'rter',
    'smartscanFailed',
    'someTagLevelsRequired',
    'tagOutOfPolicy',
    'taxAmountChanged',
    'taxOutOfPolicy',
    'taxRateChanged',
    'taxRequired',
] as const;

type ViolationName = (typeof violationNames)[number];

type TransactionViolation = {
    type: string;
    name: ViolationName;
    userMessage: string;
    data?: Record<string, string>;
};

const transactionViolationPropType = PropTypes.shape({
    type: PropTypes.string.isRequired,
    name: PropTypes.oneOf(violationNames).isRequired,
    userMessage: PropTypes.string.isRequired,
    data: PropTypes.objectOf(PropTypes.string),
});

const transactionViolationsPropTypes = PropTypes.arrayOf(transactionViolationPropType);

export {transactionViolationPropType, transactionViolationsPropTypes, violationNames};

export type {TransactionViolation, ViolationName};
