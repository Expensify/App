/* eslint-disable rulesdir/prefer-underscore-method */
import Str from 'expensify-common/lib/str';
import Onyx, {OnyxCollection} from 'react-native-onyx';
import {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {PersonalDetails} from '@src/types/onyx';
import Beta from '@src/types/onyx/Beta';
import * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import Policy from '@src/types/onyx/Policy';
import Report from '@src/types/onyx/Report';
import ReportAction, {ReportActions} from '@src/types/onyx/ReportAction';
import * as Task from './actions/Task';
import * as CollectionUtils from './CollectionUtils';
import * as LocalePhoneNumber from './LocalePhoneNumber';
import * as Localize from './Localize';
import * as OptionsListUtils from './OptionsListUtils';
import * as PersonalDetailsUtils from './PersonalDetailsUtils';
import * as ReportActionsUtils from './ReportActionsUtils';
import * as ReportUtils from './ReportUtils';
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

// Session can remain stale because the only way for the current user to change is to
// sign out and sign in, which would clear out all the Onyx
// data anyway and cause SidebarLinks to rerender.
let currentUserAccountID: number | undefined;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (session) => {
        if (!session) {
            return;
        }

        currentUserAccountID = session.accountID;
    },
});

let resolveSidebarIsReadyPromise: (args?: unknown[]) => void;

let sidebarIsReadyPromise = new Promise((resolve) => {
    resolveSidebarIsReadyPromise = resolve;
});

function resetIsSidebarLoadedReadyPromise() {
    sidebarIsReadyPromise = new Promise((resolve) => {
        resolveSidebarIsReadyPromise = resolve;
    });
}

function isSidebarLoadedReady(): Promise<unknown> {
    return sidebarIsReadyPromise;
}

function compareStringDates(a: string, b: string): 0 | 1 | -1 {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
}

function setIsSidebarLoadedReady() {
    resolveSidebarIsReadyPromise();
}

// Define a cache object to store the memoized results
const reportIDsCache = new Map<string, string[]>();

// Function to set a key-value pair while maintaining the maximum key limit
function setWithLimit<TKey, TValue>(map: Map<TKey, TValue>, key: TKey, value: TValue) {
    if (map.size >= 5) {
        // If the map has reached its limit, remove the first (oldest) key-value pair
        const firstKey = map.keys().next().value;
        map.delete(firstKey);
    }
    map.set(key, value);
}

// Variable to verify if ONYX actions are loaded
let hasInitialReportActions = false;

/**
 * @returns An array of reportIDs sorted in the proper order
 */
function getOrderedReportIDs(
    currentReportId: string | null,
    allReports: Record<string, Report>,
    betas: Beta[],
    policies: Record<string, Policy>,
    priorityMode: ValueOf<typeof CONST.PRIORITY_MODE>,
    allReportActions: OnyxCollection<ReportActions>,
): string[] {
    // Generate a unique cache key based on the function arguments
    const cachedReportsKey = JSON.stringify(
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        [currentReportId, allReports, betas, policies, priorityMode, allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${currentReportId}`]?.length || 1],
        (key, value: unknown) => {
            /**
             *  Exclude 'participantAccountIDs', 'participants' and 'lastMessageText' not to overwhelm a cached key value with huge data,
             *  which we don't need to store in a cacheKey
             */
            if (key === 'participantAccountIDs' || key === 'participants' || key === 'lastMessageText') {
                return undefined;
            }

            return value;
        },
    );

    // Check if the result is already in the cache
    const cachedIDs = reportIDsCache.get(cachedReportsKey);
    if (cachedIDs && hasInitialReportActions) {
        return cachedIDs;
    }

    // This is needed to prevent caching when Onyx is empty for a second render
    hasInitialReportActions = Object.values(lastReportActions).length > 0;

    const isInGSDMode = priorityMode === CONST.PRIORITY_MODE.GSD;
    const isInDefaultMode = !isInGSDMode;
    const allReportsDictValues = Object.values(allReports);
    // Filter out all the reports that shouldn't be displayed
    const reportsToDisplay = allReportsDictValues.filter((report) =>
        ReportUtils.shouldReportBeInOptionList(report, currentReportId ?? '', isInGSDMode, betas, policies, allReportActions, true),
    );

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

    // There are a few properties that need to be calculated for the report which are used when sorting reports.
    reportsToDisplay.forEach((report) => {
        // Normally, the spread operator would be used here to clone the report and prevent the need to reassign the params.
        // However, this code needs to be very performant to handle thousands of reports, so in the interest of speed, we're just going to disable this lint rule and add
        // the reportDisplayName property to the report object directly.
        // eslint-disable-next-line no-param-reassign
        report.displayName = ReportUtils.getReportName(report);

        // eslint-disable-next-line no-param-reassign
        report.iouReportAmount = ReportUtils.getMoneyRequestReimbursableTotal(report, allReports);

        const isPinned = report.isPinned ?? false;
        if (isPinned || ReportUtils.requiresAttentionFromCurrentUser(report)) {
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
    pinnedAndGBRReports.sort((a, b) => (a?.displayName && b?.displayName ? a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase()) : 0));
    draftReports.sort((a, b) => (a?.displayName && b?.displayName ? a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase()) : 0));

    if (isInDefaultMode) {
        nonArchivedReports.sort((a, b) => {
            const compareDates = a?.lastVisibleActionCreated && b?.lastVisibleActionCreated ? compareStringDates(b.lastVisibleActionCreated, a.lastVisibleActionCreated) : 0;
            const compareDisplayNames = a?.displayName && b?.displayName ? a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase()) : 0;
            return compareDates || compareDisplayNames;
        });
        // For archived reports ensure that most recent reports are at the top by reversing the order
        archivedReports.sort((a, b) => (a?.lastVisibleActionCreated && b?.lastVisibleActionCreated ? compareStringDates(b.lastVisibleActionCreated, a.lastVisibleActionCreated) : 0));
    } else {
        nonArchivedReports.sort((a, b) => (a?.displayName && b?.displayName ? a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase()) : 0));
        archivedReports.sort((a, b) => (a?.displayName && b?.displayName ? a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase()) : 0));
    }

    // Now that we have all the reports grouped and sorted, they must be flattened into an array and only return the reportID.
    // The order the arrays are concatenated in matters and will determine the order that the groups are displayed in the sidebar.
    const LHNReports = [...pinnedAndGBRReports, ...draftReports, ...nonArchivedReports, ...archivedReports].map((report) => report.reportID);
    setWithLimit(reportIDsCache, cachedReportsKey, LHNReports);
    return LHNReports;
}

type ActorDetails = {
    displayName?: string;
    accountID?: number;
};

/**
 * Gets all the data necessary for rendering an OptionRowLHN component
 */
function getOptionData(
    report: Report,
    reportActions: Record<string, ReportAction[]>,
    personalDetails: Record<number, PersonalDetails>,
    preferredLocale: ValueOf<typeof CONST.LOCALES>,
    policy: Policy,
    parentReportAction: ReportAction,
): ReportUtils.OptionData | undefined {
    // When a user signs out, Onyx is cleared. Due to the lazy rendering with a virtual list, it's possible for
    // this method to be called after the Onyx data has been cleared out. In that case, it's fine to do
    // a null check here and return early.
    if (!report || !personalDetails) {
        return;
    }

    const result: ReportUtils.OptionData = {
        alternateText: null,
        pendingAction: null,
        allReportErrors: null,
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
        hasOutstandingIOU: false,
        hasOutstandingChildRequest: false,
        isIOUReportOwner: null,
        iouReportAmount: 0,
        isChatRoom: false,
        isArchivedRoom: false,
        shouldShowSubscript: false,
        isPolicyExpenseChat: false,
        isMoneyRequestReport: false,
        isExpenseRequest: false,
        isWaitingOnBankAccount: false,
        isAllowedToComment: true,
    };
    const participantPersonalDetailList: PersonalDetails[] = Object.values(OptionsListUtils.getPersonalDetailsForAccountIDs(report.participantAccountIDs ?? [], personalDetails));
    const personalDetail = participantPersonalDetailList[0] ?? {};

    result.isThread = ReportUtils.isChatThread(report);
    result.isChatRoom = ReportUtils.isChatRoom(report);
    result.isTaskReport = ReportUtils.isTaskReport(report);
    result.parentReportAction = parentReportAction;
    result.isArchivedRoom = ReportUtils.isArchivedRoom(report);
    result.isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(report);
    result.isExpenseRequest = ReportUtils.isExpenseRequest(report);
    result.isMoneyRequestReport = ReportUtils.isMoneyRequestReport(report);
    result.shouldShowSubscript = ReportUtils.shouldReportShowSubscript(report);
    result.pendingAction = report.pendingFields ? report.pendingFields.addWorkspaceRoom || report.pendingFields.createChat : null;
    result.allReportErrors = OptionsListUtils.getAllReportErrors(report, reportActions) as OnyxCommon.Errors;
    result.brickRoadIndicator = Object.keys(result.allReportErrors ?? {}).length !== 0 ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
    result.ownerAccountID = report.ownerAccountID;
    result.managerID = report.managerID;
    result.reportID = report.reportID;
    result.policyID = report.policyID;
    result.stateNum = report.stateNum;
    result.statusNum = report.statusNum;
    result.isUnread = ReportUtils.isUnread(report);
    result.isUnreadWithMention = ReportUtils.isUnreadWithMention(report);
    result.hasDraftComment = report.hasDraft;
    result.isPinned = report.isPinned;
    result.iouReportID = report.iouReportID;
    result.keyForList = String(report.reportID);
    result.tooltipText = ReportUtils.getReportParticipantsTitle(report.participantAccountIDs ?? []);
    result.hasOutstandingIOU = report.hasOutstandingIOU;
    result.hasOutstandingChildRequest = report.hasOutstandingChildRequest;
    result.parentReportID = report.parentReportID ?? '';
    result.isWaitingOnBankAccount = report.isWaitingOnBankAccount;
    result.notificationPreference = report.notificationPreference ?? '';
    result.isAllowedToComment = ReportUtils.canUserPerformWriteAction(report);
    result.chatType = report.chatType;

    const hasMultipleParticipants = participantPersonalDetailList.length > 1 || result.isChatRoom || result.isPolicyExpenseChat;
    const subtitle = ReportUtils.getChatRoomSubtitle(report);

    const login = Str.removeSMSDomain(personalDetail?.login ?? '');
    const status = personalDetail?.status ?? '';
    const formattedLogin = Str.isSMSLogin(login) ? LocalePhoneNumber.formatPhoneNumber(login) : login;

    // We only create tooltips for the first 10 users or so since some reports have hundreds of users, causing performance to degrade.
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips((participantPersonalDetailList || []).slice(0, 10), hasMultipleParticipants);
    const lastMessageTextFromReport = OptionsListUtils.getLastMessageTextForReport(report);

    // If the last actor's details are not currently saved in Onyx Collection,
    // then try to get that from the last report action if that action is valid
    // to get data from.
    let lastActorDetails: ActorDetails | null = report.lastActorAccountID && personalDetails?.[report.lastActorAccountID] ? personalDetails[report.lastActorAccountID] : null;
    if (!lastActorDetails && visibleReportActionItems[report.reportID]) {
        const lastActorDisplayName = visibleReportActionItems[report.reportID]?.person?.[0]?.text;
        lastActorDetails = lastActorDisplayName
            ? {
                  displayName: lastActorDisplayName,
                  accountID: report.lastActorAccountID,
              }
            : null;
    }
    const lastActorDisplayName = hasMultipleParticipants && lastActorDetails?.accountID && Number(lastActorDetails.accountID) !== currentUserAccountID ? lastActorDetails.displayName : '';
    let lastMessageText = lastMessageTextFromReport;

    const reportAction = lastReportActions?.[report.reportID];
    if (result.isArchivedRoom) {
        const archiveReason = (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED && reportAction?.originalMessage?.reason) || CONST.REPORT.ARCHIVE_REASON.DEFAULT;

        switch (archiveReason) {
            case CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED:
            case CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY:
            case CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED: {
                lastMessageText = Localize.translate(preferredLocale, `reportArchiveReasons.${archiveReason}`, {
                    policyName: ReportUtils.getPolicyName(report, false, policy),
                    displayName: PersonalDetailsUtils.getDisplayNameOrDefault(lastActorDetails, 'displayName'),
                });
                break;
            }
            default: {
                lastMessageText = Localize.translate(preferredLocale, `reportArchiveReasons.default`);
            }
        }
    }

    if ((result.isChatRoom || result.isPolicyExpenseChat || result.isThread || result.isTaskReport) && !result.isArchivedRoom) {
        const lastAction = visibleReportActionItems[report.reportID];

        if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.RENAMED) {
            const newName = lastAction?.originalMessage?.newName ?? '';
            result.alternateText = Localize.translate(preferredLocale, 'newRoomPage.roomRenamedTo', {newName});
        } else if (ReportActionsUtils.isTaskAction(lastAction)) {
            result.alternateText = Task.getTaskReportActionMessage(lastAction.actionName, report.reportID, false);
        } else if (
            lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ROOMCHANGELOG.INVITE_TO_ROOM ||
            lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ROOMCHANGELOG.REMOVE_FROM_ROOM ||
            lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG.INVITE_TO_ROOM ||
            lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG.REMOVE_FROM_ROOM
        ) {
            const targetAccountIDs = lastAction?.originalMessage?.targetAccountIDs ?? [];
            const verb =
                lastAction.actionName === CONST.REPORT.ACTIONS.TYPE.ROOMCHANGELOG.INVITE_TO_ROOM || lastAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG.INVITE_TO_ROOM
                    ? 'invited'
                    : 'removed';
            const users = targetAccountIDs.length > 1 ? 'users' : 'user';
            result.alternateText = `${verb} ${targetAccountIDs.length} ${users}`;

            const roomName = lastAction?.originalMessage?.roomName ?? '';
            if (roomName) {
                const preposition =
                    lastAction.actionName === CONST.REPORT.ACTIONS.TYPE.ROOMCHANGELOG.INVITE_TO_ROOM || lastAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG.INVITE_TO_ROOM
                        ? ' to'
                        : ' from';
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
    result.iouReportAmount = ReportUtils.getMoneyRequestReimbursableTotal(result as Report);

    if (!hasMultipleParticipants) {
        result.accountID = personalDetail.accountID;
        result.login = personalDetail.login;
        result.phoneNumber = personalDetail.phoneNumber;
    }

    const reportName = ReportUtils.getReportName(report, policy);

    result.text = reportName;
    result.subtitle = subtitle;
    result.participantsList = participantPersonalDetailList;

    result.icons = ReportUtils.getIcons(report, personalDetails, UserUtils.getAvatar(personalDetail.avatar, personalDetail.accountID), '', -1, policy);
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
    setIsSidebarLoadedReady,
    isSidebarLoadedReady,
    resetIsSidebarLoadedReadyPromise,
};
