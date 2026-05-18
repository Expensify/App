/**
 * A map linking the optimistic MOVED_TRANSACTION or UNREPORTED_TRANSACTION reportActionID to the transactionID.
 * If we're creating the transactionThread as part of moving the transaction, we should also send the optimistic
 * transactionThreadReportID and transactionThreadCreatedReportActionID. If the transaction is held before moving to selfDM,
 * we should also send the unholdReportActionID.
 */
type TransactionThreadInfo = {
    movedReportActionID: string;
    moneyRequestPreviewReportActionID: string;
    transactionThreadReportID?: string;
    transactionThreadCreatedReportActionID?: string;
    unholdReportActionID?: string;
    selfDMReportID?: string;
    selfDMCreatedReportActionID?: string;
};

type ChangeTransactionsReportParams = {
    transactionList: string;
    reportID: string;
    transactionIDToReportActionAndThreadData: string; // A map of transactionID to TransactionThreadInfo
    transactionIDToUpdatedCustomUnitRateID?: string; // A JSON map of transactionID to the new customUnitRateID (for distance expenses moving to a workspace with an invalid rate)
};

export type {ChangeTransactionsReportParams, TransactionThreadInfo};
