import type Report from './Report';

/**
 * The subset of a report the onboarding/openReport path actually reads. Fields are added only when a helper's own body
 * proves it needs them; conciergeChatSelector must produce every key.
 */
type ConciergeChatReport = Pick<Report, 'reportID' | 'chatType' | 'policyID' | 'type' | 'permissions' | 'writeCapability' | 'errorFields' | 'parentReportID' | 'parentReportActionID'>;

export default ConciergeChatReport;
