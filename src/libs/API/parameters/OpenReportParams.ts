import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';

type OpenReportParams = {
    reportID: string;
    reportActionID?: string;
    emailList?: string;
    accountIDList?: string;
    parentReportActionID?: string;
    shouldRetry?: boolean;
    createdReportActionID?: string;
    clientLastReadTime?: string;
    groupChatAdminLogins?: string;
    reportName?: string;
    chatType?: string;
    optimisticAccountIDList?: string;
    file?: File | CustomRNImageManipulatorResult;
    guidedSetupData?: string;
    /**
     * This flag decides in what order should the api return report actions, and it's used by MoneyRequestReportView
     * By default api returns report actions newest-first, and then older ones on subsequent pagination calls.
     * If this flag is set to true, api will return oldest first starting from the beginning of report.
     */
    useTableReportView?: boolean;
    /**
     * The ID of the unreported transaction to create a thread for.
     * Used when displaying unreported expenses that have no transaction thread associated with them.
     */
    transactionID?: string;
    /**
     * The ID of the report action to create for an unreported transaction thread.
     * Used when we need to create a money request report action on the selfDM for an unreported expense.
     */
    moneyRequestPreviewReportActionID?: string;
};

export default OpenReportParams;
