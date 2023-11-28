/**
 * Names of transaction violations
 */
type ViolationName =
    | 'fieldRequired'
    | 'perDayLimit'
    | 'rter'
    | 'maxAge'
    | 'futureDate'
    | 'overLimit'
    | 'overLimitAttendee'
    | 'overCategoryLimit'
    | 'receiptRequired'
    | 'missingCategory'
    | 'categoryOutOfPolicy'
    | 'missingTag'
    | 'someTagLevelsRequired'
    | 'allTagLevelsRequired'
    | 'tagOutOfPolicy'
    | 'missingComment'
    | 'taxRequired'
    | 'taxOutOfPolicy'
    | 'taxRateChanged'
    | 'taxAmountChanged'
    | 'modifiedAmount'
    | 'receiptNotSmartScanned'
    | 'modifiedDate'
    | 'cashExpenseWithNoReceipt'
    | 'invoiceMarkup'
    | 'duplicatedTransaction'
    | 'smartscanFailed'
    | 'conversionSurcharge'
    | 'autoReportedRejectedExpense'
    | 'nonExpensiworksExpense'
    | 'billableExpense'
    | 'customUnitOutOfPolicy'
    | 'overAutoApprovalLimit'

type ViolationType = string;

type TransactionViolation = {
    type: ViolationType;
    name: ViolationName;
    userMessage: string;
    data?: Record<string, string>;
};

export type {TransactionViolation, ViolationName, ViolationType};
