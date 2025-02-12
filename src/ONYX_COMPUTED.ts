import type {OnyxCollection} from 'react-native-onyx';
import {getReportAction} from '@libs/ReportActionsUtils';
import {computeReportsByPolicy, findConciergeChatReportID} from './libs/actions/ComputedValues';
import {getReasonAndReportActionThatRequiresAttention, hasAnyViolationsToDisplayRBR, requiresAttentionFromCurrentUser} from './libs/ReportUtils';
import ONYXKEYS from './ONYXKEYS';
import type {TransactionViolation} from './types/onyx';

const ONYX_COMPUTED = {
    CONCIERGE_CHAT_REPORT_ID: {
        cacheKey: 'conciergeChatReportID',
        dependencies: [ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.CONCIERGE_REPORT_ID],
        compute: findConciergeChatReportID,
    },
    REPORTS_BY_POLICY: {
        cacheKey: 'reportsByPolicy',
        dependencies: [ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.SESSION],
        compute: computeReportsByPolicy,
    },
    REPORTS: {
        cacheKey: 'reports',
        dependencies: [ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS],
        compute: (reports: OnyxCollection<Report>, transactionViolations: OnyxCollection<TransactionViolation[]>) => {
            return Object.values(reports).reduce((acc, report) => {
                if (!report) {
                    return acc;
                }

                const hasAnyViolations = hasAnyViolationsToDisplayRBR(report, transactionViolations);
                const parentReportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
                const reasonAndReportActionThatRequiresAttention = getReasonAndReportActionThatRequiresAttention(report, parentReportAction);

                acc[report.reportID] = {
                    hasAnyViolations,
                    requiresAttentionFromCurrentUser: !!reasonAndReportActionThatRequiresAttention,
                };
                return acc;
            }, {} as Record<string, Report>);
        },
    },
};

export default ONYX_COMPUTED;
