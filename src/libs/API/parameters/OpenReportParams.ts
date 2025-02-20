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
};

export default OpenReportParams;
