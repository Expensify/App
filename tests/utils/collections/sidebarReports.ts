import type {ValueOf} from 'react-native-gesture-handler/lib/typescript/typeUtils';
import type {OnyxCollection} from 'react-native-onyx';
import type {ReportsToDisplayInLHN} from '@hooks/useSidebarOrderedReports';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Report, ReportActions, ReportAttributesDerivedValue, ReportMetadata, ReportNameValuePairs} from '@src/types/onyx';
import type Policy from '@src/types/onyx/Policy';
import createCollection from './createCollection';
import createPersonalDetails from './personalDetails';
import createRandomPolicy from './policies';
import createRandomReportAction from './reportActions';
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

const LHN_ACTIONS_PER_REPORT = 50;

function createSidebarReportActions(reportID: string, count: number): ReportActions {
    const actions: ReportActions = {};
    for (let i = 0; i < count; i++) {
        actions[`${reportID}_${i}`] = createRandomReportAction(i);
    }
    return actions;
}

function createSidebarReportsWithActions(count: number): {
    reports: OnyxCollection<Report>;
    reportActions: OnyxCollection<ReportActions>;
    reportNameValuePairs: OnyxCollection<ReportNameValuePairs>;
    policies: OnyxCollection<Policy>;
    personalDetails: OnyxCollection<PersonalDetails>;
    reportMetadata: OnyxCollection<ReportMetadata>;
} {
    const reports: OnyxCollection<Report> = {};
    const reportActions: OnyxCollection<ReportActions> = {};
    const reportNameValuePairs: OnyxCollection<ReportNameValuePairs> = {};
    const policies: OnyxCollection<Policy> = {};
    const personalDetails: OnyxCollection<PersonalDetails> = {};
    const reportMetadata: OnyxCollection<ReportMetadata> = {};

    const basePolicy = createRandomPolicy(1);
    policies[`${ONYXKEYS.COLLECTION.POLICY}${basePolicy.id}`] = basePolicy;

    for (let i = 1; i <= count; i++) {
        const reportID = String(i);
        const report = createRandomReport(i, undefined);

        const isArchived = i % 10 === 0;
        const reportTypeMod = i % 4;
        let reportType: Report['type'] = CONST.REPORT.TYPE.CHAT;
        if (reportTypeMod === 0) {
            reportType = CONST.REPORT.TYPE.IOU;
        } else if (reportTypeMod === 1) {
            reportType = CONST.REPORT.TYPE.EXPENSE;
        }

        reports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] = {
            ...report,
            type: reportType,
        };
        reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] = createSidebarReportActions(reportID, LHN_ACTIONS_PER_REPORT);
        reportNameValuePairs[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`] = {
            private_isArchived: isArchived ? 'true' : 'false',
        };

        const lastActorAccountID = report.lastActorAccountID ?? i;
        personalDetails[String(lastActorAccountID)] = createPersonalDetails(lastActorAccountID);

        if (i % 5 === 0) {
            reportMetadata[`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`] = {
                lastVisitTime: new Date().toISOString(),
            };
        }
    }

    return {
        reports,
        reportActions,
        reportNameValuePairs,
        policies,
        personalDetails,
        reportMetadata,
    };
}

export {createSidebarReport, createSidebarReportsCollection, createSidebarTestData, createSidebarReportsWithActions};
