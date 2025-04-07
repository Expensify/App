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
};

export default OpenReportParams;
