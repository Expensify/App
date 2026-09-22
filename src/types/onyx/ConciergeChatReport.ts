import type ReportFields from '@src/types/utils/ReportFields';

/**
 * The subset of the Concierge chat report that the openReport onboarding path reads. Produced only by
 * getConciergeChatReportFields; every key is required so a producer that misses one fails to compile.
 * The report ID is deliberately not named `reportID`, so this object can never be passed where a full `Report` is expected.
 */
type ConciergeChatReport = {
    conciergeReportID: string;
} & ReportFields<'chatType' | 'policyID' | 'type' | 'permissions' | 'writeCapability' | 'errorFields' | 'parentReportID' | 'parentReportActionID'>;

export default ConciergeChatReport;
