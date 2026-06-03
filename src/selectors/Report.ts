import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {TupleToUnion, ValueOf} from 'type-fest';
import {getOriginalMessage, isClosedAction} from '@libs/ReportActionsUtils';
import {canShowReportRecipientLocalTime, getPolicyIDsWithEmptyReportsForAccount, isChatRoom, isOpenExpenseReport, isPolicyExpenseChat, isThread} from '@libs/ReportUtils';
import type {ArchivedReportsIDSet} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Report, ReportActions, Transaction} from '@src/types/onyx';
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

const policyIDsWithEmptyReportsSelector =
    (accountID: number | undefined, transactionsByReportID: Record<string, Transaction[]>, hasDismissedEmptyReportsConfirmation: boolean) => (reports: OnyxCollection<Report>) => {
        if (hasDismissedEmptyReportsConfirmation || !accountID) {
            return {};
        }
        return getPolicyIDsWithEmptyReportsForAccount(reports, accountID, transactionsByReportID);
    };

const policyChatRoomsSelector =
    (policyID: string | undefined, archivedReportsIdSet: ArchivedReportsIDSet) =>
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
            if (archivedReportsIdSet.has(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`)) {
                continue;
            }
            list.push(report);
        }
        return list;
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
 */
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
        // Coerce sentinel `0` to `undefined`. The backend ships `managerID: 0` on chat reports
        // without a manager, and a later push removes the key entirely; treating both as
        // `undefined` keeps the projection stable through that reconciliation.
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        managerID: report.managerID || undefined,
        ownerAccountID: report.ownerAccountID,
        participants: report.participants,
        total: report.total,
        unheldTotal: report.unheldTotal,
        unheldNonReimbursableTotal: report.unheldNonReimbursableTotal,
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
        permissions: report.permissions,
        tripData: report.tripData,
        welcomeMessage: report.welcomeMessage,
        nextStep: report.nextStep,
        pendingAction: report.pendingAction,
        pendingFields: report.pendingFields,
    } satisfies Record<keyof StableReport, unknown> & StableReport;
}

export {
    getArchiveReason,
    getReportChatType,
    getReportOwnerAccountID,
    getReportPolicyID,
    policyIDsWithEmptyReportsSelector,
    canShowReportRecipientLocalTimeSelector,
    policyChatRoomsSelector,
    openExpenseReportIDsSelector,
    getStableReportSelector,
};

export type {StableReport};
