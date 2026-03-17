import type {ValueOf} from 'react-native-gesture-handler/lib/typescript/typeUtils';
import type {OnyxCollection} from 'react-native-onyx';
import type {ReportsToDisplayInLHN} from '@hooks/useSidebarOrderedReports';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAttributesDerivedValue, ReportNameValuePairs} from '@src/types/onyx';
import createCollection from './createCollection';
import {createRandomReport} from './reports';

/**
 * Creates a mock report for sidebar testing with specific properties
 */
function createSidebarReport(
    index: number,
    options: {
        reportName?: string;
        type?: ValueOf<typeof CONST.REPORT.TYPE>;
        isPinned?: boolean;
        hasErrorsOtherThanFailedReceipt?: boolean;
        requiresAttention?: boolean;
        lastVisibleActionCreated?: string;
        isOwnPolicyExpenseChat?: boolean;
        chatType?: ValueOf<typeof CONST.REPORT.CHAT_TYPE>;
        ownerAccountID?: number;
        policyID?: string;
        currency?: string;
    } = {},
): Report & {hasErrorsOtherThanFailedReceipt?: boolean; requiresAttention?: boolean} {
    const reportID = index.toString();
    const baseReport = createRandomReport(index, options.chatType ?? CONST.REPORT.CHAT_TYPE.POLICY_ROOM);

    return {
        ...baseReport,
        reportID,
        reportName: options.reportName ?? baseReport.reportName,
        type: options.type ?? CONST.REPORT.TYPE.CHAT,
        isPinned: options.isPinned ?? false,
        hasErrorsOtherThanFailedReceipt: options.hasErrorsOtherThanFailedReceipt ?? false,
        requiresAttention: options.requiresAttention ?? false,
        lastVisibleActionCreated: options.lastVisibleActionCreated ?? '2024-01-01 10:00:00',
        isOwnPolicyExpenseChat: options.isOwnPolicyExpenseChat ?? false,
        ownerAccountID: options.ownerAccountID ?? index,
        policyID: options.policyID ?? reportID,
        currency: options.currency ?? 'USD',
    };
}

/**
 * Creates a collection of mock reports for sidebar testing using the createCollection pattern
 */
function createSidebarReportsCollection(
    reportConfigs: Array<{
        reportName?: string;
        type?: ValueOf<typeof CONST.REPORT.TYPE>;
        isPinned?: boolean;
        hasErrorsOtherThanFailedReceipt?: boolean;
        lastVisibleActionCreated?: string;
        isOwnPolicyExpenseChat?: boolean;
        chatType?: ValueOf<typeof CONST.REPORT.CHAT_TYPE>;
        ownerAccountID?: number;
        policyID?: string;
        currency?: string;
        requiresAttention?: boolean;
    }>,
): ReportsToDisplayInLHN {
    return createCollection<Report & {hasErrorsOtherThanFailedReceipt?: boolean; requiresAttention?: boolean}>(
        (item) => item.reportID,
        (index) => createSidebarReport(index, reportConfigs.at(index) ?? {}),
        reportConfigs.length,
    );
}

/**
 * Creates a comprehensive test set with all report types
 */
function createSidebarTestData(): {
    reports: ReportsToDisplayInLHN;
    reportNameValuePairs: OnyxCollection<ReportNameValuePairs>;
    reportAttributes: ReportAttributesDerivedValue['reports'];
} {
    const reports = createSidebarReportsCollection([
        {
            reportName: 'Pinned Report',
            isPinned: true,
            hasErrorsOtherThanFailedReceipt: false,
        },
        {
            reportName: 'Error Report',
            isPinned: false,
            hasErrorsOtherThanFailedReceipt: true,
        },
        {
            reportName: 'Draft Report',
            isPinned: false,
            hasErrorsOtherThanFailedReceipt: false,
        },
        {
            reportName: 'Normal Report',
            isPinned: false,
            hasErrorsOtherThanFailedReceipt: false,
        },
        {
            reportName: 'Archived Report',
            isPinned: false,
            hasErrorsOtherThanFailedReceipt: false,
        },
    ]);

    const reportNameValuePairs = {
        [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}4`]: {
            private_isArchived: '2024-01-01 10:00:00',
        },
    };

    const reportAttributes = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '0': {
            requiresAttention: false,
            reportName: 'Test Report',
            isEmpty: false,
            brickRoadStatus: undefined,
            reportErrors: {} as Record<string, string | null>,
        },
    };

    return {
        reports,
        reportNameValuePairs,
        reportAttributes,
    };
}

export {createSidebarReport, createSidebarReportsCollection, createSidebarTestData};
