import {getOriginalMessage, isClosedAction} from '@libs/ReportActionsUtils';
import {
    canShowReportRecipientLocalTime,
    getPolicyIDsWithEmptyReportsForAccount,
    isArchivedReport,
    isChatRoom,
    isClosedReport,
    isOpenExpenseReport,
    isPolicyExpenseChat,
    isThread,
} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OutstandingReportsByPolicyIDDerivedValue, PersonalDetailsList, Report, ReportActions, ReportNameValuePairs, Transaction} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {TupleToUnion, ValueOf} from 'type-fest';

import {getLastClosedReportAction} from './ReportAction';

type OpenExpenseReportIDMap = Record<string, true>;

function getArchiveReason(reportActions: OnyxEntry<ReportActions>): ValueOf<typeof CONST.REPORT.ARCHIVE_REASON> | undefined {
    const lastClosedReportAction = getLastClosedReportAction(reportActions);

    if (!lastClosedReportAction) {
        return undefined;
    }

    return isClosedAction(lastClosedReportAction) ? getOriginalMessage(lastClosedReportAction)?.reason : CONST.REPORT.ARCHIVE_REASON.DEFAULT;
}

function getReportChatType(report: OnyxEntry<Report>) {
    return report?.chatType;
}

function getReportPolicyID(report: OnyxEntry<Report>) {
    return report?.policyID;
}

function getReportOwnerAccountID(report: OnyxEntry<Report>) {
    return report?.ownerAccountID;
}

function getReportParentReportID(report: OnyxEntry<Report>) {
    return report?.parentReportID;
}

/** Which report-type avatar wrapper the `ReportAvatar` dispatcher should render for this report. */
function reportAvatarKindSelector(report: OnyxEntry<Report>): ValueOf<typeof CONST.REPORT_AVATAR_KIND> | undefined {
    if (!report) {
        return undefined;
    }

    switch (report.type) {
        case CONST.REPORT.TYPE.EXPENSE:
            return CONST.REPORT_AVATAR_KIND.EXPENSE;
        case CONST.REPORT.TYPE.IOU:
            return CONST.REPORT_AVATAR_KIND.IOU;
        case CONST.REPORT.TYPE.TASK:
            return CONST.REPORT_AVATAR_KIND.TASK;
        case CONST.REPORT.TYPE.INVOICE:
            return CONST.REPORT_AVATAR_KIND.INVOICE;
        case CONST.REPORT.TYPE.CHAT:
            if (isThread(report)) {
                return CONST.REPORT_AVATAR_KIND.CHAT_THREAD;
            }
            break;
        case undefined:
            // Legacy `getIcons` classifies chats purely off chatType, so a chat row whose `type` hasn't populated
            // yet still routes by its chatType. Without either field there is nothing to route on.
            break;
        default:
            return CONST.REPORT_AVATAR_KIND.DEFAULT;
    }

    switch (report.chatType) {
        case CONST.REPORT.CHAT_TYPE.GROUP:
            return CONST.REPORT_AVATAR_KIND.GROUP_CHAT;
        case CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT:
            return CONST.REPORT_AVATAR_KIND.POLICY_EXPENSE_CHAT;
        case CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE:
        case CONST.REPORT.CHAT_TYPE.POLICY_ADMINS:
        case CONST.REPORT.CHAT_TYPE.POLICY_ROOM:
        case CONST.REPORT.CHAT_TYPE.DOMAIN_ALL:
        case CONST.REPORT.CHAT_TYPE.INVOICE:
            return CONST.REPORT_AVATAR_KIND.ROOM;
        default:
            // DM, self-DM, system, trip room and anything unclassified
            return CONST.REPORT_AVATAR_KIND.DEFAULT;
    }
}

/** The report fields `GroupChatAvatar` renders from: the custom avatar plus what `getGroupChatName` needs for the tooltip name */
type GroupChatAvatarReport = Pick<Report, 'reportID' | 'avatarUrl' | 'reportName' | 'participants'>;

function groupChatAvatarReportSelector(report: OnyxEntry<Report>): GroupChatAvatarReport | undefined {
    if (!report) {
        return undefined;
    }
    return {reportID: report.reportID, avatarUrl: report.avatarUrl, reportName: report.reportName, participants: report.participants};
}

const policyIDsWithEmptyReportsSelector =
    (accountID: number | undefined, transactionsByReportID: Record<string, Transaction[]>, hasDismissedEmptyReportsConfirmation: boolean) => (reports: OnyxCollection<Report>) => {
        if (hasDismissedEmptyReportsConfirmation || !accountID) {
            return {};
        }
        return getPolicyIDsWithEmptyReportsForAccount(reports, accountID, transactionsByReportID);
    };

const policyChatRoomsSelector =
    (policyID: string | undefined, reportNameValuePairs: OnyxCollection<ReportNameValuePairs>) =>
    (reports: OnyxCollection<Report>): Report[] => {
        if (!policyID || !reports) {
            return [];
        }

        const list: Report[] = [];
        for (const report of Object.values(reports)) {
            if (!report || report.policyID !== policyID) {
                continue;
            }
            if (isThread(report)) {
                continue;
            }
            if (!isChatRoom(report) && !isPolicyExpenseChat(report)) {
                continue;
            }
            if (isClosedReport(report)) {
                continue;
            }
            if (isArchivedReport(reportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`])) {
                continue;
            }
            list.push(report);
        }
        return list;
    };

/**
 * Selects archived report NVPs for the current report and possible "Move expense" destination reports.
 * This limits updates to data used to determine whether each destination report is archived.
 */
const createMoveExpenseReportNVPSelector = (outstandingReportsByPolicyID: OnyxEntry<OutstandingReportsByPolicyIDDerivedValue>, currentReportID: string | undefined) => {
    const moveExpenseReportIDs = new Set<string>();
    if (currentReportID) {
        moveExpenseReportIDs.add(currentReportID);
    }
    for (const outstandingReports of Object.values(outstandingReportsByPolicyID ?? {})) {
        for (const outstandingReport of Object.values(outstandingReports ?? {})) {
            if (outstandingReport?.reportID) {
                moveExpenseReportIDs.add(outstandingReport.reportID);
            }
        }
    }

    return (reportNameValuePairs: OnyxCollection<ReportNameValuePairs>): OnyxCollection<ReportNameValuePairs> => {
        const moveExpenseReportNVPs: OnyxCollection<ReportNameValuePairs> = {};

        for (const reportID of moveExpenseReportIDs) {
            const key = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}` as const;
            const reportNVP = reportNameValuePairs?.[key];
            if (!isArchivedReport(reportNVP)) {
                continue;
            }

            moveExpenseReportNVPs[key] = {private_isArchived: reportNVP?.private_isArchived};
        }

        return moveExpenseReportNVPs;
    };
};

function openExpenseReportIDsSelector(reports: OnyxCollection<Report>): OpenExpenseReportIDMap {
    if (!reports) {
        return {};
    }

    const openExpenseReportIDMap: OpenExpenseReportIDMap = {};
    for (const currentReport of Object.values(reports)) {
        if (!isOpenExpenseReport(currentReport) || !currentReport?.reportID) {
            continue;
        }

        openExpenseReportIDMap[currentReport.reportID] = true;
    }

    return openExpenseReportIDMap;
}

function canShowReportRecipientLocalTimeSelector(report: OnyxEntry<Report>, accountID: number) {
    return (personalDetailsList: OnyxEntry<PersonalDetailsList>) => canShowReportRecipientLocalTime(personalDetailsList, report, accountID);
}

type ValidReportKeys<T extends ReadonlyArray<keyof Report>> = T;

/**
 * Fields deliberately stripped from the projection. They update on routine activity
 * (incoming/outgoing messages, read receipts) and would invalidate the projection on every
 * chat heartbeat even though no item-subtree consumer reads them.
 */
type ExcludedFields = ValidReportKeys<
    [
        'lastMessageText',
        'lastVisibleActionCreated',
        'lastReadTime',
        'lastReadSequenceNumber',
        'lastMentionedTime',
        'lastVisibleActionLastModified',
        'lastMessageHtml',
        'lastActorAccountID',
        'lastActionType',
    ]
>;

type StableReport = Omit<Report, TupleToUnion<ExcludedFields>>;

/**
 * Stable `Report` projection for components that must not re-render on chat heartbeat
 * fields (`last*` on `Report`). Intended as a bridge until rows subscribe to derived per-row facts.
 *
 * If a consumer needs excluded fields (e.g. ConfirmWhisperContent), subscribe separately to the
 * full report — do not add those fields back into this projection.
 *
 * When adding a new `Report` field: include it in the return object below; only add to
 * `ExcludedFields` if it updates on every message/read and the subtree does not read it.
 *
 * Onyx merge replaces arrays wholesale even when their content is identical (arrays are
 * non-mergeable leaf values compared by reference), so `report.permissions` can arrive with a new
 * reference on every report push. Intern the array by content so the projection keeps a stable
 * reference and downstream shallow-equality (snapshot cache, memoized subtrees) holds.
 * The cache is bounded: values are combinations of the few CONST.REPORT.PERMISSIONS members.
 */
const stablePermissionsByContent = new Map<string, Report['permissions']>();
function getStablePermissions(permissions: Report['permissions']): Report['permissions'] {
    if (!permissions) {
        return permissions;
    }
    const contentKey = permissions.join(',');
    const cached = stablePermissionsByContent.get(contentKey);
    if (cached) {
        return cached;
    }
    stablePermissionsByContent.set(contentKey, permissions);
    return permissions;
}

function getStableReportSelector(report: OnyxEntry<Report>) {
    if (!report?.reportID) {
        return undefined;
    }
    return {
        reportID: report.reportID,
        avatarUrl: report.avatarUrl,
        created: report.created,
        submitted: report.submitted,
        approved: report.approved,
        submitterUserID: report.submitterUserID,
        submitterPayrollID: report.submitterPayrollID,
        orderDealNumbers: report.orderDealNumbers,
        debitedAmount: report.debitedAmount,
        debitedCurrency: report.debitedCurrency,
        creditedAmount: report.creditedAmount,
        creditedCurrency: report.creditedCurrency,
        chatType: report.chatType,
        hasOutstandingChildRequest: report.hasOutstandingChildRequest,
        hasOutstandingChildTask: report.hasOutstandingChildTask,
        isOwnPolicyExpenseChat: report.isOwnPolicyExpenseChat,
        isPinned: report.isPinned,
        policyAvatar: report.policyAvatar,
        policyName: report.policyName,
        oldPolicyName: report.oldPolicyName,
        hasParentAccess: report.hasParentAccess,
        description: report.description,
        isDeletedParentAction: report.isDeletedParentAction,
        policyID: report.policyID,
        reportName: report.reportName,
        chatReportID: report.chatReportID,
        stateNum: report.stateNum,
        statusNum: report.statusNum,
        writeCapability: report.writeCapability,
        type: report.type,
        visibility: report.visibility,
        invoiceReceiver: report.invoiceReceiver,
        transactionCount: report.transactionCount,
        parentReportID: report.parentReportID,
        parentReportActionID: report.parentReportActionID,
        // Coerce placeholder `0` to `undefined`. The backend ships `managerID: 0` on chat reports
        // without a manager, and a later push removes the key entirely; treating both as
        // `undefined` keeps the projection stable through that reconciliation.
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        managerID: report.managerID || undefined,
        ownerAccountID: report.ownerAccountID,
        participants: report.participants,
        total: report.total,
        unheldTotal: report.unheldTotal,
        unheldNonReimbursableTotal: report.unheldNonReimbursableTotal,
        reimbursableTotal: report.reimbursableTotal,
        unheldReimbursableTotal: report.unheldReimbursableTotal,
        currency: report.currency,
        errorFields: report.errorFields,
        errors: report.errors,
        isWaitingOnBankAccount: report.isWaitingOnBankAccount,
        isCancelledIOU: report.isCancelledIOU,
        hasReportBeenRetracted: report.hasReportBeenRetracted,
        hasReportBeenReopened: report.hasReportBeenReopened,
        isExportedToIntegration: report.isExportedToIntegration,
        hasExportError: report.hasExportError,
        iouReportID: report.iouReportID,
        preexistingReportID: report.preexistingReportID,
        nonReimbursableTotal: report.nonReimbursableTotal,
        privateNotes: report.privateNotes,
        fieldList: report.fieldList,
        permissions: getStablePermissions(report.permissions),
        tripData: report.tripData,
        welcomeMessage: report.welcomeMessage,
        nextStep: report.nextStep,
        pendingAction: report.pendingAction,
        pendingFields: report.pendingFields,
    } satisfies Record<keyof StableReport, unknown> & StableReport;
}

function isDraftReportSelector(draft: OnyxEntry<Report>): boolean {
    return !!draft;
}

export {
    getArchiveReason,
    getReportChatType,
    groupChatAvatarReportSelector,
    getReportOwnerAccountID,
    getReportParentReportID,
    getReportPolicyID,
    policyIDsWithEmptyReportsSelector,
    canShowReportRecipientLocalTimeSelector,
    policyChatRoomsSelector,
    reportAvatarKindSelector,
    createMoveExpenseReportNVPSelector,
    openExpenseReportIDsSelector,
    getStableReportSelector,
    isDraftReportSelector,
};

export type {StableReport};
