import {Str} from 'expensify-common';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {PolicySelector} from '@hooks/useReportIDs';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, PersonalDetailsList, ReportActions, ReportNameValuePairs, TransactionViolation} from '@src/types/onyx';
import type Beta from '@src/types/onyx/Beta';
import type Policy from '@src/types/onyx/Policy';
import type PriorityMode from '@src/types/onyx/PriorityMode';
import type Report from '@src/types/onyx/Report';
import type ReportAction from '@src/types/onyx/ReportAction';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import {getExpensifyCardFromReportAction} from './CardMessageUtils';
import {extractCollectionItemID} from './CollectionUtils';
import {hasValidDraftComment} from './DraftCommentUtils';
import localeCompare from './LocaleCompare';
import {formatPhoneNumber} from './LocalePhoneNumber';
import {translate, translateLocal} from './Localize';
import {getLastActorDisplayName, getLastMessageTextForReport, getPersonalDetailsForAccountIDs} from './OptionsListUtils';
import Parser from './Parser';
import Performance from './Performance';
import {getCleanedTagName, getPolicy} from './PolicyUtils';
import {
    getCardIssuedMessage,
    getLastVisibleMessage,
    getMessageOfOldDotReportAction,
    getOriginalMessage,
    getPolicyChangeLogAddEmployeeMessage,
    getPolicyChangeLogChangeRoleMessage,
    getPolicyChangeLogDefaultBillableMessage,
    getPolicyChangeLogDefaultTitleEnforcedMessage,
    getPolicyChangeLogDeleteMemberMessage,
    getPolicyChangeLogEmployeeLeftMessage,
    getPolicyChangeLogMaxExpenseAmountMessage,
    getPolicyChangeLogMaxExpesnseAmountNoReceiptMessage,
    getRemovedConnectionMessage,
    getRenamedAction,
    getReportAction,
    getReportActionMessageText,
    getSortedReportActions,
    getUpdateRoomDescriptionMessage,
    getWorkspaceCategoryUpdateMessage,
    getWorkspaceCurrencyUpdateMessage,
    getWorkspaceCustomUnitRateAddedMessage,
    getWorkspaceDescriptionUpdatedMessage,
    getWorkspaceFrequencyUpdateMessage,
    getWorkspaceReportFieldAddMessage,
    getWorkspaceReportFieldDeleteMessage,
    getWorkspaceReportFieldUpdateMessage,
    getWorkspaceTagUpdateMessage,
    getWorkspaceUpdateFieldMessage,
    isActionOfType,
    isCardIssuedAction,
    isInviteOrRemovedAction,
    isOldDotReportAction,
    isRenamedAction,
    isTagModificationAction,
    isTaskAction,
    shouldReportActionBeVisibleAsLastAction,
} from './ReportActionsUtils';
import type {OptionData} from './ReportUtils';
import {
    canUserPerformWriteAction as canUserPerformWriteActionUtil,
    doesReportBelongToWorkspace,
    formatReportLastMessageText,
    getAllReportActionsErrorsAndReportActionThatRequiresAttention,
    getAllReportErrors,
    getChatRoomSubtitle,
    getDisplayNameForParticipant,
    getDisplayNamesWithTooltips,
    getIcons,
    getParticipantsAccountIDsForDisplay,
    getPolicyName,
    getReportDescription,
    getReportName,
    getReportNameValuePairs,
    getReportNotificationPreference,
    getReportParticipantsTitle,
    getReportSubtitlePrefix,
    getWorkspaceNameUpdatedMessage,
    hasReportErrorsOtherThanFailedReceipt,
    isAdminRoom,
    isAnnounceRoom,
    isArchivedNonExpenseReport,
    isArchivedReportWithID,
    isChatRoom,
    isChatThread,
    isConciergeChatReport,
    isDeprecatedGroupDM,
    isDomainRoom,
    isExpenseReport,
    isExpenseRequest,
    isGroupChat as isGroupChatUtil,
    isHiddenForCurrentUser,
    isInvoiceReport,
    isInvoiceRoom,
    isIOUOwnedByCurrentUser,
    isJoinRequestInAdminRoom,
    isMoneyRequestReport,
    isOneTransactionThread,
    isPolicyExpenseChat,
    isSelfDM,
    isSystemChat as isSystemChatUtil,
    isTaskReport,
    isThread,
    isUnread,
    isUnreadWithMention,
    requiresAttentionFromCurrentUser,
    shouldDisplayViolationsRBRInLHN,
    shouldReportBeInOptionList,
    shouldReportShowSubscript,
} from './ReportUtils';
import {getTaskReportActionMessage} from './TaskUtils';

type WelcomeMessage = {showReportName: boolean; phrase1?: string; phrase2?: string; phrase3?: string; phrase4?: string; messageText?: string; messageHtml?: string};

const visibleReportActionItems: ReportActions = {};
let allPersonalDetails: OnyxEntry<PersonalDetailsList>;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        allPersonalDetails = value ?? {};
    },
});

let allReports: OnyxCollection<Report>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReports = value;
    },
});

Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    callback: (actions, key) => {
        if (!actions || !key) {
            return;
        }
        const reportID = extractCollectionItemID(key);
        const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
        const canUserPerformWriteAction = canUserPerformWriteActionUtil(report);
        const actionsArray: ReportAction[] = getSortedReportActions(Object.values(actions));

        // The report is only visible if it is the last action not deleted that
        // does not match a closed or created state.
        const reportActionsForDisplay = actionsArray.filter(
            (reportAction) => shouldReportActionBeVisibleAsLastAction(reportAction, canUserPerformWriteAction) && reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED,
        );

        const reportAction = reportActionsForDisplay.at(-1);
        if (!reportAction) {
            delete visibleReportActionItems[reportID];
            return;
        }
        visibleReportActionItems[reportID] = reportAction;
    },
});

function compareStringDates(a: string, b: string): 0 | 1 | -1 {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
}

/**
 * A mini report object that contains only the necessary information to sort reports.
 * This is used to avoid copying the entire report object and only the necessary information.
 */
type MiniReport = {
    reportID?: string;
    displayName: string;
    lastVisibleActionCreated?: string;
};

function ensureSingleSpacing(text: string) {
    return text.replace(CONST.REGEX.WHITESPACE, ' ').trim();
}

/**
 * @returns An array of reportIDs sorted in the proper order
 */
function getOrderedReportIDs(
    currentReportId: string | undefined,
    reports: OnyxCollection<Report>,
    betas: OnyxEntry<Beta[]>,
    policies: OnyxCollection<PolicySelector>,
    priorityMode: OnyxEntry<PriorityMode>,
    transactionViolations: OnyxCollection<TransactionViolation[]>,
    currentPolicyID = '',
    policyMemberAccountIDs: number[] = [],
): string[] {
    Performance.markStart(CONST.TIMING.GET_ORDERED_REPORT_IDS);
    const isInFocusMode = priorityMode === CONST.PRIORITY_MODE.GSD;
    const isInDefaultMode = !isInFocusMode;
    const allReportsDictValues =
        currentPolicyID === ''
            ? Object.values(reports ?? {})
            : Object.values(reports ?? {}).filter((report) => report?.reportID === currentReportId || doesReportBelongToWorkspace(report, policyMemberAccountIDs, currentPolicyID));
    // Filter out all the reports that shouldn't be displayed
    const reportsToDisplay: Array<Report & {hasErrorsOtherThanFailedReceipt?: boolean}> = [];
    allReportsDictValues.forEach((report) => {
        if (!report) {
            return;
        }
        if ((Object.values(CONST.REPORT.UNSUPPORTED_TYPE) as string[]).includes(report?.type ?? '')) {
            return;
        }
        const parentReportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
        const doesReportHaveViolations = shouldDisplayViolationsRBRInLHN(report, transactionViolations);
        const isHidden = isHiddenForCurrentUser(report);
        const isFocused = report.reportID === currentReportId;
        const hasErrorsOtherThanFailedReceipt = hasReportErrorsOtherThanFailedReceipt(report, doesReportHaveViolations, transactionViolations);
        const isReportInAccessible = report?.errorFields?.notFound;
        if (isOneTransactionThread(report.reportID, report.parentReportID, parentReportAction)) {
            return;
        }
        if (hasErrorsOtherThanFailedReceipt && !isReportInAccessible) {
            reportsToDisplay.push({
                ...report,
                hasErrorsOtherThanFailedReceipt: true,
            });
            return;
        }
        const isSystemChat = isSystemChatUtil(report);
        const shouldOverrideHidden =
            hasValidDraftComment(report.reportID) ||
            hasErrorsOtherThanFailedReceipt ||
            isFocused ||
            isSystemChat ||
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            report.isPinned ||
            requiresAttentionFromCurrentUser(report, parentReportAction);
        if (isHidden && !shouldOverrideHidden) {
            return;
        }

        if (
            shouldReportBeInOptionList({
                report,
                currentReportId,
                isInFocusMode,
                betas,
                policies: policies as OnyxCollection<Policy>,
                excludeEmptyChats: true,
                doesReportHaveViolations,
                includeSelfDM: true,
            })
        ) {
            reportsToDisplay.push(report);
        }
    });

    // The LHN is split into five distinct groups, and each group is sorted a little differently. The groups will ALWAYS be in this order:
    // 1. Pinned/GBR - Always sorted by reportDisplayName
    // 2. Error reports - Always sorted by reportDisplayName
    // 3. Drafts - Always sorted by reportDisplayName
    // 4. Non-archived reports and settled IOUs
    //      - Sorted by lastVisibleActionCreated in default (most recent) view mode
    //      - Sorted by reportDisplayName in GSD (focus) view mode
    // 5. Archived reports
    //      - Sorted by lastVisibleActionCreated in default (most recent) view mode
    //      - Sorted by reportDisplayName in GSD (focus) view mode

    const pinnedAndGBRReports: MiniReport[] = [];
    const errorReports: MiniReport[] = [];
    const draftReports: MiniReport[] = [];
    const nonArchivedReports: MiniReport[] = [];
    const archivedReports: MiniReport[] = [];

    // There are a few properties that need to be calculated for the report which are used when sorting reports.
    reportsToDisplay.forEach((reportToDisplay) => {
        const report = reportToDisplay;
        const miniReport: MiniReport = {
            reportID: report?.reportID,
            displayName: getReportName(report),
            lastVisibleActionCreated: report?.lastVisibleActionCreated,
        };

        const isPinned = report?.isPinned ?? false;
        const reportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
        const reportNameValuePairs = getReportNameValuePairs(report?.reportID);
        if (isPinned || requiresAttentionFromCurrentUser(report, reportAction)) {
            pinnedAndGBRReports.push(miniReport);
        } else if (report?.hasErrorsOtherThanFailedReceipt) {
            errorReports.push(miniReport);
        } else if (hasValidDraftComment(report?.reportID)) {
            draftReports.push(miniReport);
        } else if (isArchivedNonExpenseReport(report, reportNameValuePairs)) {
            archivedReports.push(miniReport);
        } else {
            nonArchivedReports.push(miniReport);
        }
    });

    // Sort each group of reports accordingly
    pinnedAndGBRReports.sort((a, b) => (a?.displayName && b?.displayName ? localeCompare(a.displayName, b.displayName) : 0));
    errorReports.sort((a, b) => (a?.displayName && b?.displayName ? localeCompare(a.displayName, b.displayName) : 0));
    draftReports.sort((a, b) => (a?.displayName && b?.displayName ? localeCompare(a.displayName, b.displayName) : 0));

    if (isInDefaultMode) {
        nonArchivedReports.sort((a, b) => {
            const compareDates = a?.lastVisibleActionCreated && b?.lastVisibleActionCreated ? compareStringDates(b.lastVisibleActionCreated, a.lastVisibleActionCreated) : 0;
            if (compareDates) {
                return compareDates;
            }
            const compareDisplayNames = a?.displayName && b?.displayName ? localeCompare(a.displayName, b.displayName) : 0;
            return compareDisplayNames;
        });
        // For archived reports ensure that most recent reports are at the top by reversing the order
        archivedReports.sort((a, b) => (a?.lastVisibleActionCreated && b?.lastVisibleActionCreated ? compareStringDates(b.lastVisibleActionCreated, a.lastVisibleActionCreated) : 0));
    } else {
        nonArchivedReports.sort((a, b) => (a?.displayName && b?.displayName ? localeCompare(a.displayName, b.displayName) : 0));
        archivedReports.sort((a, b) => (a?.displayName && b?.displayName ? localeCompare(a.displayName, b.displayName) : 0));
    }

    // Now that we have all the reports grouped and sorted, they must be flattened into an array and only return the reportID.
    // The order the arrays are concatenated in matters and will determine the order that the groups are displayed in the sidebar.

    const LHNReports = [...pinnedAndGBRReports, ...errorReports, ...draftReports, ...nonArchivedReports, ...archivedReports].map((report) => report?.reportID).filter(Boolean) as string[];

    Performance.markEnd(CONST.TIMING.GET_ORDERED_REPORT_IDS);
    return LHNReports;
}

type ReasonAndReportActionThatHasRedBrickRoad = {
    reason: ValueOf<typeof CONST.RBR_REASONS>;
    reportAction?: OnyxEntry<ReportAction>;
};

function getReasonAndReportActionThatHasRedBrickRoad(
    report: Report,
    reportActions: OnyxEntry<ReportActions>,
    hasViolations: boolean,
    transactionViolations?: OnyxCollection<TransactionViolation[]>,
): ReasonAndReportActionThatHasRedBrickRoad | null {
    const {reportAction} = getAllReportActionsErrorsAndReportActionThatRequiresAttention(report, reportActions);
    const errors = getAllReportErrors(report, reportActions);
    const hasErrors = Object.keys(errors).length !== 0;

    if (isArchivedReportWithID(report.reportID)) {
        return null;
    }

    if (shouldDisplayViolationsRBRInLHN(report, transactionViolations)) {
        return {
            reason: CONST.RBR_REASONS.HAS_TRANSACTION_THREAD_VIOLATIONS,
        };
    }

    if (hasErrors) {
        return {
            reason: CONST.RBR_REASONS.HAS_ERRORS,
            reportAction,
        };
    }

    if (hasViolations) {
        return {
            reason: CONST.RBR_REASONS.HAS_VIOLATIONS,
        };
    }

    return null;
}

function shouldShowRedBrickRoad(report: Report, reportActions: OnyxEntry<ReportActions>, hasViolations: boolean, transactionViolations?: OnyxCollection<TransactionViolation[]>) {
    return !!getReasonAndReportActionThatHasRedBrickRoad(report, reportActions, hasViolations, transactionViolations);
}

/**
 * Gets all the data necessary for rendering an OptionRowLHN component
 */
function getOptionData({
    report,
    oneTransactionThreadReport,
    reportNameValuePairs,
    reportActions,
    personalDetails,
    preferredLocale,
    policy,
    parentReportAction,
    hasViolations,
    lastMessageTextFromReport: lastMessageTextFromReportProp,
    transactionViolations,
    invoiceReceiverPolicy,
}: {
    report: OnyxEntry<Report>;
    oneTransactionThreadReport: OnyxEntry<Report>;
    reportNameValuePairs: OnyxEntry<ReportNameValuePairs>;
    reportActions: OnyxEntry<ReportActions>;
    personalDetails: OnyxEntry<PersonalDetailsList>;
    preferredLocale: DeepValueOf<typeof CONST.LOCALES>;
    policy: OnyxEntry<Policy> | undefined;
    parentReportAction: OnyxEntry<ReportAction> | undefined;
    hasViolations: boolean;
    lastMessageTextFromReport?: string;
    invoiceReceiverPolicy?: OnyxEntry<Policy>;
    transactionViolations?: OnyxCollection<TransactionViolation[]>;
}): OptionData | undefined {
    // When a user signs out, Onyx is cleared. Due to the lazy rendering with a virtual list, it's possible for
    // this method to be called after the Onyx data has been cleared out. In that case, it's fine to do
    // a null check here and return early.
    if (!report || !personalDetails) {
        return;
    }

    const result: OptionData = {
        text: '',
        alternateText: undefined,
        allReportErrors: getAllReportErrors(report, reportActions),
        brickRoadIndicator: null,
        tooltipText: null,
        subtitle: undefined,
        login: undefined,
        accountID: undefined,
        reportID: '',
        phoneNumber: undefined,
        isUnread: null,
        isUnreadWithMention: null,
        hasDraftComment: false,
        keyForList: undefined,
        searchText: undefined,
        isPinned: false,
        hasOutstandingChildRequest: false,
        hasOutstandingChildTask: false,
        hasParentAccess: undefined,
        isIOUReportOwner: null,
        isChatRoom: false,
        private_isArchived: undefined,
        shouldShowSubscript: false,
        isPolicyExpenseChat: false,
        isMoneyRequestReport: false,
        isExpenseRequest: false,
        isWaitingOnBankAccount: false,
        isAllowedToComment: true,
        isDeletedParentAction: false,
        isConciergeChat: false,
    };

    const participantAccountIDs = getParticipantsAccountIDsForDisplay(report);
    const visibleParticipantAccountIDs = getParticipantsAccountIDsForDisplay(report, true);

    const participantPersonalDetailList = Object.values(getPersonalDetailsForAccountIDs(participantAccountIDs, personalDetails));
    const personalDetail = participantPersonalDetailList.at(0) ?? ({} as PersonalDetails);

    result.isThread = isChatThread(report);
    result.isChatRoom = isChatRoom(report);
    result.isTaskReport = isTaskReport(report);
    result.isInvoiceReport = isInvoiceReport(report);
    result.parentReportAction = parentReportAction;
    result.private_isArchived = reportNameValuePairs?.private_isArchived;
    result.isPolicyExpenseChat = isPolicyExpenseChat(report);
    result.isExpenseRequest = isExpenseRequest(report);
    result.isMoneyRequestReport = isMoneyRequestReport(report);
    result.shouldShowSubscript = shouldReportShowSubscript(report);
    result.pendingAction = report.pendingFields?.addWorkspaceRoom ?? report.pendingFields?.createChat;
    result.brickRoadIndicator = shouldShowRedBrickRoad(report, reportActions, hasViolations, transactionViolations) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
    result.ownerAccountID = report.ownerAccountID;
    result.managerID = report.managerID;
    result.reportID = report.reportID;
    result.policyID = report.policyID;
    result.stateNum = report.stateNum;
    result.statusNum = report.statusNum;
    // When the only message of a report is deleted lastVisibileActionCreated is not reset leading to wrongly
    // setting it Unread so we add additional condition here to avoid empty chat LHN from being bold.
    result.isUnread = isUnread(report, oneTransactionThreadReport) && !!report.lastActorAccountID;
    result.isUnreadWithMention = isUnreadWithMention(report);
    result.isPinned = report.isPinned;
    result.iouReportID = report.iouReportID;
    result.keyForList = String(report.reportID);
    result.hasOutstandingChildRequest = report.hasOutstandingChildRequest;
    result.parentReportID = report.parentReportID;
    result.isWaitingOnBankAccount = report.isWaitingOnBankAccount;
    result.notificationPreference = getReportNotificationPreference(report);
    result.isAllowedToComment = canUserPerformWriteActionUtil(report);
    result.chatType = report.chatType;
    result.isDeletedParentAction = report.isDeletedParentAction;
    result.isSelfDM = isSelfDM(report);
    result.tooltipText = getReportParticipantsTitle(visibleParticipantAccountIDs);
    result.hasOutstandingChildTask = report.hasOutstandingChildTask;
    result.hasParentAccess = report.hasParentAccess;
    result.isConciergeChat = isConciergeChatReport(report);
    result.participants = report.participants;

    const hasMultipleParticipants = participantPersonalDetailList.length > 1 || result.isChatRoom || result.isPolicyExpenseChat || isExpenseReport(report);
    const subtitle = getChatRoomSubtitle(report);

    const login = Str.removeSMSDomain(personalDetail?.login ?? '');
    const status = personalDetail?.status ?? '';
    const formattedLogin = Str.isSMSLogin(login) ? formatPhoneNumber(login) : login;

    // We only create tooltips for the first 10 users or so since some reports have hundreds of users, causing performance to degrade.
    const displayNamesWithTooltips = getDisplayNamesWithTooltips((participantPersonalDetailList || []).slice(0, 10), hasMultipleParticipants, undefined, isSelfDM(report));

    // If the last actor's details are not currently saved in Onyx Collection,
    // then try to get that from the last report action if that action is valid
    // to get data from.
    let lastActorDetails: Partial<PersonalDetails> | null = report.lastActorAccountID && personalDetails?.[report.lastActorAccountID] ? personalDetails[report.lastActorAccountID] : null;

    if (!lastActorDetails && visibleReportActionItems[report.reportID]) {
        const lastActorDisplayName = visibleReportActionItems[report.reportID]?.person?.[0]?.text;
        lastActorDetails = lastActorDisplayName
            ? {
                  displayName: lastActorDisplayName,
                  accountID: report.lastActorAccountID,
              }
            : null;
    }

    const lastActorDisplayName = getLastActorDisplayName(lastActorDetails, hasMultipleParticipants);

    let lastMessageTextFromReport = lastMessageTextFromReportProp;
    if (!lastMessageTextFromReport) {
        lastMessageTextFromReport = getLastMessageTextForReport(report, lastActorDetails, policy);
    }

    // We need to remove sms domain in case the last message text has a phone number mention with sms domain.
    let lastMessageText = Str.removeSMSDomain(lastMessageTextFromReport);

    const lastAction = visibleReportActionItems[report.reportID];
    const isGroupChat = isGroupChatUtil(report) || isDeprecatedGroupDM(report);

    const isThreadMessage = isThread(report) && lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT && lastAction?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    if ((result.isChatRoom || result.isPolicyExpenseChat || result.isThread || result.isTaskReport || isThreadMessage || isGroupChat) && !result.private_isArchived) {
        const lastActionName = lastAction?.actionName ?? report.lastActionType;
        const prefix = getReportSubtitlePrefix(report);

        if (isRenamedAction(lastAction)) {
            result.alternateText = getRenamedAction(lastAction);
        } else if (isTaskAction(lastAction)) {
            result.alternateText = formatReportLastMessageText(getTaskReportActionMessage(lastAction).text);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_ROOM) {
            const actionMessage = getReportActionMessageText(lastAction);
            result.alternateText = actionMessage ? `${lastActorDisplayName}: ${actionMessage}` : '';
        } else if (isInviteOrRemovedAction(lastAction)) {
            let actorDetails;
            if (lastAction.actorAccountID) {
                actorDetails = personalDetails?.[lastAction?.actorAccountID];
            }
            let actorDisplayName = lastAction?.person?.[0]?.text;
            if (!actorDetails && actorDisplayName && lastAction.actorAccountID) {
                actorDetails = {
                    displayName: actorDisplayName,
                    accountID: lastAction.actorAccountID,
                };
            }
            actorDisplayName = actorDetails ? getLastActorDisplayName(actorDetails, hasMultipleParticipants) : undefined;
            const lastActionOriginalMessage = lastAction?.actionName ? getOriginalMessage(lastAction) : null;
            const targetAccountIDs = lastActionOriginalMessage?.targetAccountIDs ?? [];
            const targetAccountIDsLength = targetAccountIDs.length !== 0 ? targetAccountIDs.length : report.lastMessageHtml?.match(/<mention-user[^>]*><\/mention-user>/g)?.length ?? 0;
            const verb =
                lastActionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM || lastActionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM
                    ? translate(preferredLocale, 'workspace.invite.invited')
                    : translate(preferredLocale, 'workspace.invite.removed');
            const users = translate(preferredLocale, targetAccountIDsLength > 1 ? 'workspace.invite.users' : 'workspace.invite.user');
            result.alternateText = formatReportLastMessageText(`${actorDisplayName ?? lastActorDisplayName} ${verb} ${targetAccountIDsLength} ${users}`);
            const roomName = getReportName(allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${lastActionOriginalMessage?.reportID}`]);
            if (roomName) {
                const preposition =
                    lastAction.actionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM || lastAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM
                        ? ` ${translate(preferredLocale, 'workspace.invite.to')}`
                        : ` ${translate(preferredLocale, 'workspace.invite.from')}`;
                result.alternateText += `${preposition} ${roomName}`;
            }
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_DESCRIPTION)) {
            result.alternateText = `${lastActorDisplayName} ${getUpdateRoomDescriptionMessage(lastAction)}`;
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_NAME)) {
            result.alternateText = getWorkspaceNameUpdatedMessage(lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DESCRIPTION)) {
            result.alternateText = getWorkspaceDescriptionUpdatedMessage(lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY)) {
            result.alternateText = getWorkspaceCurrencyUpdateMessage(lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REPORTING_FREQUENCY)) {
            result.alternateText = getWorkspaceFrequencyUpdateMessage(lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_UPGRADE)) {
            result.alternateText = translateLocal('workspaceActions.upgradedWorkspace');
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.TEAM_DOWNGRADE)) {
            result.alternateText = translateLocal('workspaceActions.downgradedWorkspace');
        } else if (
            isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY) ||
            isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CATEGORY) ||
            isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY) ||
            isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SET_CATEGORY_NAME)
        ) {
            result.alternateText = getWorkspaceCategoryUpdateMessage(lastAction);
        } else if (isTagModificationAction(lastAction?.actionName)) {
            result.alternateText = getCleanedTagName(getWorkspaceTagUpdateMessage(lastAction) ?? '');
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CUSTOM_UNIT_RATE)) {
            result.alternateText = getWorkspaceCustomUnitRateAddedMessage(lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_REPORT_FIELD)) {
            result.alternateText = getWorkspaceReportFieldAddMessage(lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REPORT_FIELD)) {
            result.alternateText = getWorkspaceReportFieldUpdateMessage(lastAction);
        } else if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_REPORT_FIELD)) {
            result.alternateText = getWorkspaceReportFieldDeleteMessage(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FIELD) {
            result.alternateText = getWorkspaceUpdateFieldMessage(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT) {
            result.alternateText = getPolicyChangeLogMaxExpesnseAmountNoReceiptMessage(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT) {
            result.alternateText = getPolicyChangeLogMaxExpenseAmountMessage(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_BILLABLE) {
            result.alternateText = getPolicyChangeLogDefaultBillableMessage(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE_ENFORCED) {
            result.alternateText = getPolicyChangeLogDefaultTitleEnforcedMessage(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_POLICY) {
            result.alternateText = getPolicyChangeLogEmployeeLeftMessage(lastAction, true);
        } else if (isCardIssuedAction(lastAction)) {
            const card = getExpensifyCardFromReportAction({reportAction: lastAction, policyID: report.policyID});
            result.alternateText = getCardIssuedMessage({reportAction: lastAction, card});
        } else if (lastAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW && lastActorDisplayName && lastMessageTextFromReport) {
            result.alternateText = formatReportLastMessageText(Parser.htmlToText(`${lastActorDisplayName}: ${lastMessageText}`));
        } else if (lastAction && isOldDotReportAction(lastAction)) {
            result.alternateText = getMessageOfOldDotReportAction(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EMPLOYEE) {
            result.alternateText = getPolicyChangeLogAddEmployeeMessage(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE) {
            result.alternateText = getPolicyChangeLogChangeRoleMessage(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_EMPLOYEE) {
            result.alternateText = getPolicyChangeLogDeleteMemberMessage(lastAction);
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_RATE) {
            result.alternateText = getReportActionMessageText(lastAction) ?? '';
        } else if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_INTEGRATION) {
            result.alternateText = getRemovedConnectionMessage(lastAction);
        } else {
            result.alternateText =
                lastMessageTextFromReport.length > 0
                    ? formatReportLastMessageText(Parser.htmlToText(lastMessageText))
                    : getLastVisibleMessage(report.reportID, result.isAllowedToComment, {}, lastAction)?.lastMessageText;

            if (!result.alternateText) {
                result.alternateText = formatReportLastMessageText(getWelcomeMessage(report, policy).messageText ?? translateLocal('report.noActivityYet'));
            }
        }
        result.alternateText = prefix + result.alternateText;
    } else {
        if (!lastMessageText) {
            lastMessageText = formatReportLastMessageText(getWelcomeMessage(report, policy).messageText ?? translateLocal('report.noActivityYet'));
        }
        result.alternateText = formatReportLastMessageText(Parser.htmlToText(lastMessageText)) || formattedLogin;
    }

    result.isIOUReportOwner = isIOUOwnedByCurrentUser(result as Report);

    if (isJoinRequestInAdminRoom(report)) {
        result.isUnread = true;
        result.brickRoadIndicator = CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
    }

    if (!hasMultipleParticipants) {
        result.accountID = personalDetail?.accountID ?? CONST.DEFAULT_NUMBER_ID;
        result.login = personalDetail?.login ?? '';
        result.phoneNumber = personalDetail?.phoneNumber ?? '';
    }

    const reportName = getReportName(report, policy, undefined, undefined, invoiceReceiverPolicy);

    result.text = reportName;
    result.subtitle = subtitle;
    result.participantsList = participantPersonalDetailList;

    result.icons = getIcons(report, personalDetails, personalDetail?.avatar, personalDetail?.login, personalDetail?.accountID ?? CONST.DEFAULT_NUMBER_ID, policy, invoiceReceiverPolicy);
    result.displayNamesWithTooltips = displayNamesWithTooltips;

    if (status) {
        result.status = status;
    }
    result.type = report.type;

    return result;
}

function getWelcomeMessage(report: OnyxEntry<Report>, policy: OnyxEntry<Policy>): WelcomeMessage {
    const welcomeMessage: WelcomeMessage = {showReportName: true};
    if (isChatThread(report) || isTaskReport(report)) {
        return welcomeMessage;
    }

    if (isChatRoom(report)) {
        return getRoomWelcomeMessage(report);
    }

    if (isPolicyExpenseChat(report)) {
        if (policy?.description) {
            welcomeMessage.messageHtml = policy.description;
            welcomeMessage.messageText = Parser.htmlToText(welcomeMessage.messageHtml);
        } else {
            welcomeMessage.phrase1 = translateLocal('reportActionsView.beginningOfChatHistoryPolicyExpenseChatPartOne');
            welcomeMessage.phrase2 = translateLocal('reportActionsView.beginningOfChatHistoryPolicyExpenseChatPartTwo');
            welcomeMessage.phrase3 = translateLocal('reportActionsView.beginningOfChatHistoryPolicyExpenseChatPartThree');
            welcomeMessage.messageText = ensureSingleSpacing(
                `${welcomeMessage.phrase1} ${getDisplayNameForParticipant({accountID: report?.ownerAccountID})} ${welcomeMessage.phrase2} ${getPolicyName({report})} ${
                    welcomeMessage.phrase3
                }`,
            );
        }
        return welcomeMessage;
    }

    if (isSelfDM(report)) {
        welcomeMessage.phrase1 = translateLocal('reportActionsView.beginningOfChatHistorySelfDM');
        welcomeMessage.messageText = welcomeMessage.phrase1;
        return welcomeMessage;
    }

    if (isSystemChatUtil(report)) {
        welcomeMessage.phrase1 = translateLocal('reportActionsView.beginningOfChatHistorySystemDM');
        welcomeMessage.messageText = welcomeMessage.phrase1;
        return welcomeMessage;
    }

    welcomeMessage.phrase1 = translateLocal('reportActionsView.beginningOfChatHistory');
    const participantAccountIDs = getParticipantsAccountIDsForDisplay(report, undefined, undefined, true);
    const isMultipleParticipant = participantAccountIDs.length > 1;
    const displayNamesWithTooltips = getDisplayNamesWithTooltips(getPersonalDetailsForAccountIDs(participantAccountIDs, allPersonalDetails), isMultipleParticipant);
    const displayNamesWithTooltipsText = displayNamesWithTooltips
        .map(({displayName}, index) => {
            if (index === displayNamesWithTooltips.length - 1) {
                return `${displayName}.`;
            }
            if (index === displayNamesWithTooltips.length - 2) {
                return `${displayName} ${translateLocal('common.and')}`;
            }
            if (index < displayNamesWithTooltips.length - 2) {
                return `${displayName},`;
            }
            return '';
        })
        .join(' ');

    welcomeMessage.messageText = displayNamesWithTooltips.length ? ensureSingleSpacing(`${welcomeMessage.phrase1} ${displayNamesWithTooltipsText}`) : '';
    return welcomeMessage;
}

/**
 * Get welcome message based on room type
 */
function getRoomWelcomeMessage(report: OnyxEntry<Report>): WelcomeMessage {
    const welcomeMessage: WelcomeMessage = {showReportName: true};
    const workspaceName = getPolicyName({report});

    if (report?.description) {
        welcomeMessage.messageHtml = getReportDescription(report);
        welcomeMessage.messageText = Parser.htmlToText(welcomeMessage.messageHtml);
        return welcomeMessage;
    }

    if (isArchivedReportWithID(report?.reportID)) {
        welcomeMessage.phrase1 = translateLocal('reportActionsView.beginningOfArchivedRoomPartOne');
        welcomeMessage.phrase2 = translateLocal('reportActionsView.beginningOfArchivedRoomPartTwo');
    } else if (isDomainRoom(report)) {
        welcomeMessage.showReportName = false;
        welcomeMessage.phrase1 = translateLocal('reportActionsView.beginningOfChatHistoryDomainRoomPartOne', {domainRoom: report?.reportName ?? ''});
        welcomeMessage.phrase2 = translateLocal('reportActionsView.beginningOfChatHistoryDomainRoomPartTwo');
    } else if (isAdminRoom(report)) {
        welcomeMessage.showReportName = true;
        welcomeMessage.phrase1 = translateLocal('reportActionsView.beginningOfChatHistoryAdminRoomPartOneFirst');
        welcomeMessage.phrase2 = translateLocal('reportActionsView.beginningOfChatHistoryAdminRoomWorkspaceName', {workspaceName});
        welcomeMessage.phrase3 = translateLocal('reportActionsView.beginningOfChatHistoryAdminRoomPartOneLast');
        welcomeMessage.phrase4 = translateLocal('reportActionsView.beginningOfChatHistoryAdminRoomPartTwo');
    } else if (isAnnounceRoom(report)) {
        welcomeMessage.showReportName = false;
        welcomeMessage.phrase1 = translateLocal('reportActionsView.beginningOfChatHistoryAnnounceRoomPartOne', {workspaceName});
        welcomeMessage.phrase2 = translateLocal('reportActionsView.beginningOfChatHistoryAnnounceRoomPartTwo');
    } else if (isInvoiceRoom(report)) {
        welcomeMessage.showReportName = false;
        welcomeMessage.phrase1 = translateLocal('reportActionsView.beginningOfChatHistoryInvoiceRoomPartOne');
        welcomeMessage.phrase2 = translateLocal('reportActionsView.beginningOfChatHistoryInvoiceRoomPartTwo');
        const payer =
            report?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL
                ? getDisplayNameForParticipant({accountID: report?.invoiceReceiver?.accountID})
                : getPolicy(report?.invoiceReceiver?.policyID)?.name;
        const receiver = getPolicyName({report});
        welcomeMessage.messageText = `${welcomeMessage.phrase1}${payer} ${translateLocal('common.and')} ${receiver}${welcomeMessage.phrase2}`;
        return welcomeMessage;
    } else {
        // Message for user created rooms or other room types.
        welcomeMessage.phrase1 = translateLocal('reportActionsView.beginningOfChatHistoryUserRoomPartOne');
        welcomeMessage.phrase2 = translateLocal('reportActionsView.beginningOfChatHistoryUserRoomPartTwo');
    }
    welcomeMessage.messageText = ensureSingleSpacing(`${welcomeMessage.phrase1} ${welcomeMessage.showReportName ? getReportName(report) : ''} ${welcomeMessage.phrase2 ?? ''}`);

    return welcomeMessage;
}

export default {
    getOptionData,
    getOrderedReportIDs,
    getWelcomeMessage,
    getReasonAndReportActionThatHasRedBrickRoad,
    shouldShowRedBrickRoad,
};
