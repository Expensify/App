/**
 * Names of transaction violations
 */
type ViolationName =
    | 'allTagLevelsRequired'
    | 'autoReportedRejectedExpense'
    | 'billableExpense'
    | 'cashExpenseWithNoReceipt'
    | 'categoryOutOfPolicy'
    | 'conversionSurcharge'
    | 'customUnitOutOfPolicy'
    | 'duplicatedTransaction'
    | 'fieldRequired'
    | 'futureDate'
    | 'invoiceMarkup'
    | 'maxAge'
    | 'missingCategory'
    | 'missingComment'
    | 'missingTag'
    | 'modifiedAmount'
    | 'modifiedDate'
    | 'nonExpensiworksExpense'
    | 'overAutoApprovalLimit'
    | 'overCategoryLimit'
    | 'overLimit'
    | 'overLimitAttendee'
    | 'perDayLimit'
    | 'receiptNotSmartScanned'
    | 'receiptRequired'
    | 'rter'
    | 'smartscanFailed'
    | 'someTagLevelsRequired'
    | 'tagOutOfPolicy'
    | 'taxAmountChanged'
    | 'taxOutOfPolicy'
    | 'taxRateChanged'
    | 'taxRequired';

type TransactionViolation = {
    type: string;
    name: ViolationName;
    userMessage: string;
    data?: Record<string, string>;
};

export type {TransactionViolation, ViolationName};
