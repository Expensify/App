/* eslint-disable rulesdir/prefer-underscore-method */
import Str from 'expensify-common/lib/str';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, PersonalDetailsList, TransactionViolation} from '@src/types/onyx';
import type Beta from '@src/types/onyx/Beta';
import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import type {ReportActions} from '@src/types/onyx/ReportAction';
import type ReportAction from '@src/types/onyx/ReportAction';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import * as CollectionUtils from './CollectionUtils';
import localeCompare from './LocaleCompare';
import * as LocalePhoneNumber from './LocalePhoneNumber';
import * as Localize from './Localize';
import * as OptionsListUtils from './OptionsListUtils';
import * as ReportActionsUtils from './ReportActionsUtils';
import * as ReportUtils from './ReportUtils';
import * as TaskUtils from './TaskUtils';
import * as UserUtils from './UserUtils';

const visibleReportActionItems: ReportActions = {};
const lastReportActions: ReportActions = {};

Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    callback: (actions, key) => {
        if (!key || !actions) {
            return;
        }
        const reportID = CollectionUtils.extractCollectionItemID(key);

        const actionsArray: ReportAction[] = ReportActionsUtils.getSortedReportActions(Object.values(actions));
        lastReportActions[reportID] = actionsArray[actionsArray.length - 1];

        // The report is only visible if it is the last action not deleted that
        // does not match a closed or created state.
        const reportActionsForDisplay = actionsArray.filter(
            (reportAction, actionKey) =>
                ReportActionsUtils.shouldReportActionBeVisible(reportAction, actionKey) &&
                !ReportActionsUtils.isWhisperAction(reportAction) &&
                reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED &&
                reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        );
        visibleReportActionItems[reportID] = reportActionsForDisplay[reportActionsForDisplay.length - 1];
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
 * @returns An array of reportIDs sorted in the proper order
 */
function getOrderedReportIDs(
    currentReportId: string | null,
    allReports: Record<string, Report>,
    betas: Beta[],
    policies: Record<string, Policy>,
    priorityMode: ValueOf<typeof CONST.PRIORITY_MODE>,
    allReportActions: OnyxCollection<ReportAction[]>,
    transactionViolations: OnyxCollection<TransactionViolation[]>,
    currentPolicyID = '',
    policyMemberAccountIDs: number[] = [],
): string[] {
    const isInGSDMode = priorityMode === CONST.PRIORITY_MODE.GSD;
    const isInDefaultMode = !isInGSDMode;
    const allReportsDictValues = Object.values(allReports);

    // Filter out all the reports that shouldn't be displayed
    let reportsToDisplay = allReportsDictValues.filter((report) => {
        const parentReportActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.parentReportID}`;
        const parentReportActions = allReportActions?.[parentReportActionsKey];
        const parentReportAction = parentReportActions?.find((action) => action && report && action?.reportActionID === report?.parentReportActionID);
        const doesReportHaveViolations =
            betas.includes(CONST.BETAS.VIOLATIONS) && !!parentReportAction && ReportUtils.doesTransactionThreadHaveViolations(report, transactionViolations, parentReportAction);
        return ReportUtils.shouldReportBeInOptionList({
            report,
            currentReportId: currentReportId ?? '',
            isInGSDMode,
            betas,
            policies,
            excludeEmptyChats: true,
            doesReportHaveViolations,
            includeSelfDM: true,
        });
    });

    if (reportsToDisplay.length === 0) {
        // Display Concierge chat report when there is no report to be displayed
        const conciergeChatReport = allReportsDictValues.find(ReportUtils.isConciergeChatReport);
        if (conciergeChatReport) {
            reportsToDisplay.push(conciergeChatReport);
        }
    }

    // The LHN is split into four distinct groups, and each group is sorted a little differently. The groups will ALWAYS be in this order:
    // 1. Pinned/GBR - Always sorted by reportDisplayName
    // 2. Drafts - Always sorted by reportDisplayName
    // 3. Non-archived reports and settled IOUs
    //      - Sorted by lastVisibleActionCreated in default (most recent) view mode
    //      - Sorted by reportDisplayName in GSD (focus) view mode
    // 4. Archived reports
    //      - Sorted by lastVisibleActionCreated in default (most recent) view mode
    //      - Sorted by reportDisplayName in GSD (focus) view mode
    const pinnedAndGBRReports: Report[] = [];
    const draftReports: Report[] = [];
    const nonArchivedReports: Report[] = [];
    const archivedReports: Report[] = [];

    if (currentPolicyID || policyMemberAccountIDs.length > 0) {
        reportsToDisplay = reportsToDisplay.filter((report) => ReportUtils.doesReportBelongToWorkspace(report, policyMemberAccountIDs, currentPolicyID));
    }
    // There are a few properties that need to be calculated for the report which are used when sorting reports.
    reportsToDisplay.forEach((report) => {
        // Normally, the spread operator would be used here to clone the report and prevent the need to reassign the params.
        // However, this code needs to be very performant to handle thousands of reports, so in the interest of speed, we're just going to disable this lint rule and add
        // the reportDisplayName property to the report object directly.
        // eslint-disable-next-line no-param-reassign
        report.displayName = ReportUtils.getReportName(report);

        const isPinned = report.isPinned ?? false;
        const reportAction = ReportActionsUtils.getReportAction(report.parentReportID ?? '', report.parentReportActionID ?? '');
        if (isPinned || ReportUtils.requiresAttentionFromCurrentUser(report, reportAction)) {
            pinnedAndGBRReports.push(report);
        } else if (report.hasDraft) {
            draftReports.push(report);
        } else if (ReportUtils.isArchivedRoom(report)) {
            archivedReports.push(report);
        } else {
            nonArchivedReports.push(report);
        }
    });

    // Sort each group of reports accordingly
    pinnedAndGBRReports.sort((a, b) => (a?.displayName && b?.displayName ? localeCompare(a.displayName, b.displayName) : 0));
    draftReports.sort((a, b) => (a?.displayName && b?.displayName ? localeCompare(a.displayName, b.displayName) : 0));

    if (isInDefaultMode) {
        nonArchivedReports.sort((a, b) => {
            const compareDates = a?.lastVisibleActionCreated && b?.lastVisibleActionCreated ? compareStringDates(b.lastVisibleActionCreated, a.lastVisibleActionCreated) : 0;
            const compareDisplayNames = a?.displayName && b?.displayName ? localeCompare(a.displayName, b.displayName) : 0;
            return compareDates || compareDisplayNames;
        });
        // For archived reports ensure that most recent reports are at the top by reversing the order
        archivedReports.sort((a, b) => (a?.lastVisibleActionCreated && b?.lastVisibleActionCreated ? compareStringDates(b.lastVisibleActionCreated, a.lastVisibleActionCreated) : 0));
    } else {
        nonArchivedReports.sort((a, b) => (a?.displayName && b?.displayName ? localeCompare(a.displayName, b.displayName) : 0));
        archivedReports.sort((a, b) => (a?.displayName && b?.displayName ? localeCompare(a.displayName, b.displayName) : 0));
    }

    // Now that we have all the reports grouped and sorted, they must be flattened into an array and only return the reportID.
    // The order the arrays are concatenated in matters and will determine the order that the groups are displayed in the sidebar.
    const LHNReports = [...pinnedAndGBRReports, ...draftReports, ...nonArchivedReports, ...archivedReports].map((report) => report.reportID);
    return LHNReports;
}

/**
 * Gets all the data necessary for rendering an OptionRowLHN component
 */
function getOptionData({
    report,
    reportActions,
    personalDetails,
    preferredLocale,
    policy,
    parentReportAction,
    hasViolations,
}: {
    report: OnyxEntry<Report>;
    reportActions: OnyxEntry<ReportActions>;
    personalDetails: OnyxEntry<PersonalDetailsList>;
    preferredLocale: DeepValueOf<typeof CONST.LOCALES>;
    policy: OnyxEntry<Policy> | undefined;
    parentReportAction: OnyxEntry<ReportAction> | undefined;
    hasViolations: boolean;
}): ReportUtils.OptionData | undefined {
    // When a user signs out, Onyx is cleared. Due to the lazy rendering with a virtual list, it's possible for
    // this method to be called after the Onyx data has been cleared out. In that case, it's fine to do
    // a null check here and return early.
    if (!report || !personalDetails) {
        return;
    }

    const result: ReportUtils.OptionData = {
        text: '',
        alternateText: null,
        allReportErrors: OptionsListUtils.getAllReportErrors(report, reportActions),
        brickRoadIndicator: null,
        tooltipText: null,
        subtitle: null,
        login: null,
        accountID: null,
        reportID: '',
        phoneNumber: null,
        isUnread: null,
        isUnreadWithMention: null,
        hasDraftComment: false,
        keyForList: null,
        searchText: null,
        isPinned: false,
        hasOutstandingChildRequest: false,
        isIOUReportOwner: null,
        isChatRoom: false,
        isArchivedRoom: false,
        shouldShowSubscript: false,
        isPolicyExpenseChat: false,
        isMoneyRequestReport: false,
        isExpenseRequest: false,
        isWaitingOnBankAccount: false,
        isAllowedToComment: true,
        isDeletedParentAction: false,
    };

    let participantAccountIDs = report.participantAccountIDs ?? [];

    // Currently, currentUser is not included in participantAccountIDs, so for selfDM we need to add the currentUser(report owner) as participants.
    if (ReportUtils.isSelfDM(report)) {
        participantAccountIDs = [report.ownerAccountID ?? 0];
    }

    const participantPersonalDetailList = Object.values(OptionsListUtils.getPersonalDetailsForAccountIDs(participantAccountIDs, personalDetails)) as PersonalDetails[];
    const personalDetail = participantPersonalDetailList[0] ?? {};
    const hasErrors = Object.keys(result.allReportErrors ?? {}).length !== 0;

    result.isThread = ReportUtils.isChatThread(report);
    result.isChatRoom = ReportUtils.isChatRoom(report);
    result.isTaskReport = ReportUtils.isTaskReport(report);
    result.parentReportAction = parentReportAction;
    result.isArchivedRoom = ReportUtils.isArchivedRoom(report);
    result.isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(report);
    result.isExpenseRequest = ReportUtils.isExpenseRequest(report);
    result.isMoneyRequestReport = ReportUtils.isMoneyRequestReport(report);
    result.shouldShowSubscript = ReportUtils.shouldReportShowSubscript(report);
    result.pendingAction = report.pendingFields?.addWorkspaceRoom ?? report.pendingFields?.createChat;
    result.brickRoadIndicator = hasErrors || hasViolations ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
    result.ownerAccountID = report.ownerAccountID;
    result.managerID = report.managerID;
    result.reportID = report.reportID;
    result.policyID = report.policyID;
    result.stateNum = report.stateNum;
    result.statusNum = report.statusNum;
    // When the only message of a report is deleted lastVisibileActionCreated is not reset leading to wrongly
    // setting it Unread so we add additional condition here to avoid empty chat LHN from being bold.
    result.isUnread = ReportUtils.isUnread(report) && !!report.lastActorAccountID;
    result.isUnreadWithMention = ReportUtils.isUnreadWithMention(report);
    result.hasDraftComment = report.hasDraft;
    result.isPinned = report.isPinned;
    result.iouReportID = report.iouReportID;
    result.keyForList = String(report.reportID);
    result.tooltipText = ReportUtils.getReportParticipantsTitle(report.visibleChatMemberAccountIDs ?? []);
    result.hasOutstandingChildRequest = report.hasOutstandingChildRequest;
    result.parentReportID = report.parentReportID ?? '';
    result.isWaitingOnBankAccount = report.isWaitingOnBankAccount;
    result.notificationPreference = report.notificationPreference;
    result.isAllowedToComment = ReportUtils.canUserPerformWriteAction(report);
    result.chatType = report.chatType;
    result.isDeletedParentAction = report.isDeletedParentAction;
    result.isSelfDM = ReportUtils.isSelfDM(report);

    const hasMultipleParticipants = participantPersonalDetailList.length > 1 || result.isChatRoom || result.isPolicyExpenseChat || ReportUtils.isExpenseReport(report);
    const subtitle = ReportUtils.getChatRoomSubtitle(report);

    const login = Str.removeSMSDomain(personalDetail?.login ?? '');
    const status = personalDetail?.status ?? '';
    const formattedLogin = Str.isSMSLogin(login) ? LocalePhoneNumber.formatPhoneNumber(login) : login;

    // We only create tooltips for the first 10 users or so since some reports have hundreds of users, causing performance to degrade.
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(
        (participantPersonalDetailList || []).slice(0, 10),
        hasMultipleParticipants,
        undefined,
        ReportUtils.isSelfDM(report),
    );

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

    const lastActorDisplayName = OptionsListUtils.getLastActorDisplayName(lastActorDetails, hasMultipleParticipants);
    const lastMessageTextFromReport = OptionsListUtils.getLastMessageTextForReport(report, lastActorDetails, policy);

    let lastMessageText = lastMessageTextFromReport;

    const reportAction = lastReportActions?.[report.reportID];

    const isThreadMessage =
        ReportUtils.isThread(report) && reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT && reportAction?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

    if ((result.isChatRoom || result.isPolicyExpenseChat || result.isThread || result.isTaskReport || isThreadMessage) && !result.isArchivedRoom) {
        const lastAction = visibleReportActionItems[report.reportID];

        if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.RENAMED) {
            const newName = lastAction?.originalMessage?.newName ?? '';
            result.alternateText = Localize.translate(preferredLocale, 'newRoomPage.roomRenamedTo', {newName});
        } else if (ReportActionsUtils.isTaskAction(lastAction)) {
            result.alternateText = TaskUtils.getTaskReportActionMessage(lastAction.actionName);
        } else if (
            lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ROOMCHANGELOG.INVITE_TO_ROOM ||
            lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ROOMCHANGELOG.REMOVE_FROM_ROOM ||
            lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG.INVITE_TO_ROOM ||
            lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG.REMOVE_FROM_ROOM
        ) {
            const targetAccountIDs = lastAction?.originalMessage?.targetAccountIDs ?? [];
            const verb =
                lastAction.actionName === CONST.REPORT.ACTIONS.TYPE.ROOMCHANGELOG.INVITE_TO_ROOM || lastAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG.INVITE_TO_ROOM
                    ? Localize.translate(preferredLocale, 'workspace.invite.invited')
                    : Localize.translate(preferredLocale, 'workspace.invite.removed');
            const users = Localize.translate(preferredLocale, targetAccountIDs.length > 1 ? 'workspace.invite.users' : 'workspace.invite.user');
            result.alternateText = `${lastActorDisplayName} ${verb} ${targetAccountIDs.length} ${users}`.trim();

            const roomName = lastAction?.originalMessage?.roomName ?? '';
            if (roomName) {
                const preposition =
                    lastAction.actionName === CONST.REPORT.ACTIONS.TYPE.ROOMCHANGELOG.INVITE_TO_ROOM || lastAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG.INVITE_TO_ROOM
                        ? ` ${Localize.translate(preferredLocale, 'workspace.invite.to')}`
                        : ` ${Localize.translate(preferredLocale, 'workspace.invite.from')}`;
                result.alternateText += `${preposition} ${roomName}`;
            }
        } else if (lastAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW && lastActorDisplayName && lastMessageTextFromReport) {
            result.alternateText = `${lastActorDisplayName}: ${lastMessageText}`;
        } else {
            result.alternateText = lastMessageTextFromReport.length > 0 ? lastMessageText : Localize.translate(preferredLocale, 'report.noActivityYet');
        }
    } else {
        if (!lastMessageText) {
            // Here we get the beginning of chat history message and append the display name for each user, adding pronouns if there are any.
            // We also add a fullstop after the final name, the word "and" before the final name and commas between all previous names.
            lastMessageText =
                Localize.translate(preferredLocale, 'reportActionsView.beginningOfChatHistory') +
                displayNamesWithTooltips
                    .map(({displayName, pronouns}, index) => {
                        const formattedText = !pronouns ? displayName : `${displayName} (${pronouns})`;

                        if (index === displayNamesWithTooltips.length - 1) {
                            return `${formattedText}.`;
                        }
                        if (index === displayNamesWithTooltips.length - 2) {
                            return `${formattedText} ${Localize.translate(preferredLocale, 'common.and')}`;
                        }
                        if (index < displayNamesWithTooltips.length - 2) {
                            return `${formattedText},`;
                        }

                        return '';
                    })
                    .join(' ');
        }

        result.alternateText = lastMessageText || formattedLogin;
    }

    result.isIOUReportOwner = ReportUtils.isIOUOwnedByCurrentUser(result as Report);

    if (!hasMultipleParticipants) {
        result.accountID = personalDetail?.accountID;
        result.login = personalDetail?.login;
        result.phoneNumber = personalDetail?.phoneNumber;
    }

    const reportName = ReportUtils.getReportName(report, policy);

    result.text = reportName;
    result.subtitle = subtitle;
    result.participantsList = participantPersonalDetailList;

    result.icons = ReportUtils.getIcons(report, personalDetails, UserUtils.getAvatar(personalDetail?.avatar ?? {}, personalDetail?.accountID), '', -1, policy);
    result.searchText = OptionsListUtils.getSearchText(report, reportName, participantPersonalDetailList, result.isChatRoom || result.isPolicyExpenseChat, result.isThread);
    result.displayNamesWithTooltips = displayNamesWithTooltips;

    if (status) {
        result.status = status;
    }
    result.type = report.type;

    return result;
}

export default {
    getOptionData,
    getOrderedReportIDs,
};
