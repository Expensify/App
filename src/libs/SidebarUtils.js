import Onyx from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import lodashOrderBy from 'lodash/orderBy';
import Str from 'expensify-common/lib/str';
import ONYXKEYS from '../ONYXKEYS';
import * as ReportUtils from './ReportUtils';
import * as ReportActionsUtils from './ReportActionsUtils';
import * as Localize from './Localize';
import CONST from '../CONST';
import * as OptionsListUtils from './OptionsListUtils';
import * as CollectionUtils from './CollectionUtils';
import * as LocalePhoneNumber from './LocalePhoneNumber';
import * as UserUtils from './UserUtils';
import * as PersonalDetailsUtils from './PersonalDetailsUtils';

const visibleReportActionItems = {};
const lastReportActions = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    callback: (actions, key) => {
        if (!key || !actions) {
            return;
        }
        const reportID = CollectionUtils.extractCollectionItemID(key);

        const actionsArray = ReportActionsUtils.getSortedReportActions(_.toArray(actions));
        lastReportActions[reportID] = _.last(actionsArray);

        // The report is only visible if it is the last action not deleted that
        // does not match a closed or created state.
        const reportActionsForDisplay = _.filter(
            actionsArray,
            (reportAction, actionKey) => ReportActionsUtils.shouldReportActionBeVisible(reportAction, actionKey) && reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED,
        );
        visibleReportActionItems[reportID] = _.last(reportActionsForDisplay);
    },
});

// Session can remain stale because the only way for the current user to change is to
// sign out and sign in, which would clear out all the Onyx
// data anyway and cause SidebarLinks to rerender.
let currentUserAccountID;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        if (!val) {
            return;
        }

        currentUserAccountID = val.accountID;
    },
});

let resolveSidebarIsReadyPromise;

let sidebarIsReadyPromise = new Promise((resolve) => {
    resolveSidebarIsReadyPromise = resolve;
});

function resetIsSidebarLoadedReadyPromise() {
    sidebarIsReadyPromise = new Promise((resolve) => {
        resolveSidebarIsReadyPromise = resolve;
    });
}

function isSidebarLoadedReady() {
    return sidebarIsReadyPromise;
}

function setIsSidebarLoadedReady() {
    resolveSidebarIsReadyPromise();
}

/**
 * @param {String} currentReportId
 * @param {Object} allReportsDict
 * @param {Object} betas
 * @param {String[]} policies
 * @param {String} priorityMode
 * @param {Object} allReportActions
 * @returns {String[]} An array of reportIDs sorted in the proper order
 */
function getOrderedReportIDs(currentReportId, allReportsDict, betas, policies, priorityMode, allReportActions) {
    const isInGSDMode = priorityMode === CONST.PRIORITY_MODE.GSD;
    const isInDefaultMode = !isInGSDMode;

    // Filter out all the reports that shouldn't be displayed
    const reportsToDisplay = _.filter(allReportsDict, (report) =>
        ReportUtils.shouldReportBeInOptionList(report, currentReportId, isInGSDMode, allReportsDict, betas, policies, allReportActions),
    );

    if (_.isEmpty(reportsToDisplay)) {
        // Display Concierge chat report when there is no report to be displayed
        const conciergeChatReport = _.find(allReportsDict, ReportUtils.isConciergeChatReport);
        if (conciergeChatReport) {
            reportsToDisplay.push(conciergeChatReport);
        }
    }

    // There are a few properties that need to be calculated for the report which are used when sorting reports.
    _.each(reportsToDisplay, (report) => {
        // Normally, the spread operator would be used here to clone the report and prevent the need to reassign the params.
        // However, this code needs to be very performant to handle thousands of reports, so in the interest of speed, we're just going to disable this lint rule and add
        // the reportDisplayName property to the report object directly.
        // eslint-disable-next-line no-param-reassign
        report.displayName = ReportUtils.getReportName(report);

        // eslint-disable-next-line no-param-reassign
        report.iouReportAmount = ReportUtils.getMoneyRequestTotal(report, allReportsDict);
    });

    // The LHN is split into five distinct groups, and each group is sorted a little differently. The groups will ALWAYS be in this order:
    // 1. Pinned - Always sorted by reportDisplayName
    // 2. Outstanding IOUs - Always sorted by iouReportAmount with the largest amounts at the top of the group
    // 3. Drafts - Always sorted by reportDisplayName
    // 4. Non-archived reports
    //      - Sorted by lastVisibleActionCreated in default (most recent) view mode
    //      - Sorted by reportDisplayName in GSD (focus) view mode
    // 5. Archived reports
    //      - Sorted by lastVisibleActionCreated in default (most recent) view mode
    //      - Sorted by reportDisplayName in GSD (focus) view mode
    let pinnedReports = [];
    let outstandingIOUReports = [];
    let draftReports = [];
    let nonArchivedReports = [];
    let archivedReports = [];
    _.each(reportsToDisplay, (report) => {
        if (report.isPinned) {
            pinnedReports.push(report);
            return;
        }

        if (ReportUtils.isWaitingForIOUActionFromCurrentUser(report, allReportsDict)) {
            outstandingIOUReports.push(report);
            return;
        }

        if (report.hasDraft) {
            draftReports.push(report);
            return;
        }

        if (ReportUtils.isArchivedRoom(report)) {
            archivedReports.push(report);
            return;
        }

        nonArchivedReports.push(report);
    });

    // Sort each group of reports accordingly
    pinnedReports = _.sortBy(pinnedReports, (report) => report.displayName.toLowerCase());
    outstandingIOUReports = lodashOrderBy(outstandingIOUReports, ['iouReportAmount', (report) => report.displayName.toLowerCase()], ['desc', 'asc']);
    draftReports = _.sortBy(draftReports, (report) => report.displayName.toLowerCase());
    nonArchivedReports = isInDefaultMode
        ? lodashOrderBy(nonArchivedReports, ['lastVisibleActionCreated', (report) => report.displayName.toLowerCase()], ['desc', 'asc'])
        : lodashOrderBy(nonArchivedReports, [(report) => report.displayName.toLowerCase()], ['asc']);
    archivedReports = _.sortBy(archivedReports, (report) => (isInDefaultMode ? report.lastVisibleActionCreated : report.displayName.toLowerCase()));

    // For archived reports ensure that most recent reports are at the top by reversing the order of the arrays because underscore will only sort them in ascending order
    if (isInDefaultMode) {
        archivedReports.reverse();
    }

    // Now that we have all the reports grouped and sorted, they must be flattened into an array and only return the reportID.
    // The order the arrays are concatenated in matters and will determine the order that the groups are displayed in the sidebar.
    return _.pluck([].concat(pinnedReports).concat(outstandingIOUReports).concat(draftReports).concat(nonArchivedReports).concat(archivedReports), 'reportID');
}

/**
 * Gets all the data necessary for rendering an OptionRowLHN component
 *
 * @param {Object} report
 * @param {Object} reportActions
 * @param {Object} personalDetails
 * @param {String} preferredLocale
 * @param {Object} [policy]
 * @returns {Object}
 */
function getOptionData(report, reportActions, personalDetails, preferredLocale, policy) {
    // When a user signs out, Onyx is cleared. Due to the lazy rendering with a virtual list, it's possible for
    // this method to be called after the Onyx data has been cleared out. In that case, it's fine to do
    // a null check here and return early.
    if (!report || !personalDetails) {
        return;
    }
    const result = {
        text: null,
        alternateText: null,
        pendingAction: null,
        allReportErrors: null,
        brickRoadIndicator: null,
        icons: null,
        tooltipText: null,
        ownerAccountID: null,
        subtitle: null,
        participantsList: null,
        login: null,
        accountID: null,
        managerID: null,
        reportID: null,
        phoneNumber: null,
        payPalMeAddress: null,
        isUnread: null,
        isUnreadWithMention: null,
        hasDraftComment: false,
        keyForList: null,
        searchText: null,
        isPinned: false,
        hasOutstandingIOU: false,
        iouReportID: null,
        isIOUReportOwner: null,
        iouReportAmount: 0,
        isChatRoom: false,
        isArchivedRoom: false,
        shouldShowSubscript: false,
        isPolicyExpenseChat: false,
        isMoneyRequestReport: false,
        isExpenseRequest: false,
        isWaitingOnBankAccount: false,
        isLastMessageDeletedParentAction: false,
        isAllowedToComment: true,
    };

    const participantPersonalDetailList = _.values(OptionsListUtils.getPersonalDetailsForAccountIDs(report.participantAccountIDs, personalDetails));
    const personalDetail = participantPersonalDetailList[0] || {};

    result.isThread = ReportUtils.isChatThread(report);
    result.isChatRoom = ReportUtils.isChatRoom(report);
    result.isTaskReport = ReportUtils.isTaskReport(report);
    if (result.isTaskReport) {
        result.isCompletedTaskReport = ReportUtils.isCompletedTaskReport(report);
        result.isTaskAssignee = ReportUtils.isTaskAssignee(report);
    }
    result.isArchivedRoom = ReportUtils.isArchivedRoom(report);
    result.isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(report);
    result.isExpenseRequest = ReportUtils.isExpenseRequest(report);
    result.isMoneyRequestReport = ReportUtils.isMoneyRequestReport(report);
    result.shouldShowSubscript = ReportUtils.shouldReportShowSubscript(report);
    result.pendingAction = report.pendingFields ? report.pendingFields.addWorkspaceRoom || report.pendingFields.createChat : null;
    result.allReportErrors = OptionsListUtils.getAllReportErrors(report, reportActions);
    result.brickRoadIndicator = !_.isEmpty(result.allReportErrors) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
    result.ownerAccountID = report.ownerAccountID;
    result.managerID = report.managerID;
    result.reportID = report.reportID;
    result.isUnread = ReportUtils.isUnread(report);
    result.isUnreadWithMention = ReportUtils.isUnreadWithMention(report);
    result.hasDraftComment = report.hasDraft;
    result.isPinned = report.isPinned;
    result.iouReportID = report.iouReportID;
    result.keyForList = String(report.reportID);
    result.tooltipText = ReportUtils.getReportParticipantsTitle(report.participantAccountIDs || []);
    result.hasOutstandingIOU = report.hasOutstandingIOU;
    result.parentReportID = report.parentReportID || null;
    result.isWaitingOnBankAccount = report.isWaitingOnBankAccount;
    result.notificationPreference = report.notificationPreference || null;

    const {addWorkspaceRoomOrChatErrors} = ReportUtils.getReportOfflinePendingActionAndErrors(report);
    // If the composer is hidden then the user is not allowed to comment, same can be used to hide the draft icon.
    result.isAllowedToComment = !ReportUtils.shouldHideComposer(report, addWorkspaceRoomOrChatErrors);

    const hasMultipleParticipants = participantPersonalDetailList.length > 1 || result.isChatRoom || result.isPolicyExpenseChat;
    const subtitle = ReportUtils.getChatRoomSubtitle(report);

    const login = Str.removeSMSDomain(lodashGet(personalDetail, 'login', ''));
    const formattedLogin = Str.isSMSLogin(login) ? LocalePhoneNumber.formatPhoneNumber(login) : login;

    // We only create tooltips for the first 10 users or so since some reports have hundreds of users, causing performance to degrade.
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips((participantPersonalDetailList || []).slice(0, 10), hasMultipleParticipants);
    const lastMessageTextFromReport = OptionsListUtils.getLastMessageTextForReport(report);

    // If the last actor's details are not currently saved in Onyx Collection,
    // then try to get that from the last report action if that action is valid
    // to get data from.
    let lastActorDetails = personalDetails[report.lastActorAccountID] || null;
    if (!lastActorDetails && visibleReportActionItems[report.reportID]) {
        const lastActorDisplayName = lodashGet(visibleReportActionItems[report.reportID], 'person[0].text');
        lastActorDetails = lastActorDisplayName
            ? {
                  displayName: lastActorDisplayName,
                  accountID: report.lastActorAccountID,
              }
            : null;
    }
    let lastMessageText =
        hasMultipleParticipants && lastActorDetails && lastActorDetails.accountID && Number(lastActorDetails.accountID) !== currentUserAccountID ? `${lastActorDetails.displayName}: ` : '';
    lastMessageText += report ? lastMessageTextFromReport : '';

    if (result.isArchivedRoom) {
        const archiveReason =
            (lastReportActions[report.reportID] && lastReportActions[report.reportID].originalMessage && lastReportActions[report.reportID].originalMessage.reason) ||
            CONST.REPORT.ARCHIVE_REASON.DEFAULT;
        lastMessageText = Localize.translate(preferredLocale, `reportArchiveReasons.${archiveReason}`, {
            displayName: archiveReason.displayName || PersonalDetailsUtils.getDisplayNameOrDefault(lastActorDetails, 'displayName'),
            policyName: ReportUtils.getPolicyName(report, false, policy),
        });
    }

    if ((result.isChatRoom || result.isPolicyExpenseChat || result.isThread || result.isTaskReport) && !result.isArchivedRoom) {
        const lastAction = visibleReportActionItems[report.reportID];
        if (lodashGet(lastAction, 'actionName', '') === CONST.REPORT.ACTIONS.TYPE.RENAMED) {
            const newName = lodashGet(lastAction, 'originalMessage.newName', '');
            result.alternateText = Localize.translate(preferredLocale, 'newRoomPage.roomRenamedTo', {newName});
        } else if (lodashGet(lastAction, 'actionName', '') === CONST.REPORT.ACTIONS.TYPE.TASKREOPENED) {
            result.alternateText = `${Localize.translate(preferredLocale, 'task.messages.reopened')}: ${report.reportName}`;
        } else if (lodashGet(lastAction, 'actionName', '') === CONST.REPORT.ACTIONS.TYPE.TASKCOMPLETED) {
            result.alternateText = `${Localize.translate(preferredLocale, 'task.messages.completed')}: ${report.reportName}`;
        } else {
            result.alternateText = lastMessageTextFromReport.length > 0 ? lastMessageText : Localize.translate(preferredLocale, 'report.noActivityYet');
        }
    } else {
        if (!lastMessageText) {
            // Here we get the beginning of chat history message and append the display name for each user, adding pronouns if there are any.
            // We also add a fullstop after the final name, the word "and" before the final name and commas between all previous names.
            lastMessageText =
                Localize.translate(preferredLocale, 'reportActionsView.beginningOfChatHistory') +
                _.map(displayNamesWithTooltips, ({displayName, pronouns}, index) => {
                    const formattedText = _.isEmpty(pronouns) ? displayName : `${displayName} (${pronouns})`;

                    if (index === displayNamesWithTooltips.length - 1) {
                        return `${formattedText}.`;
                    }
                    if (index === displayNamesWithTooltips.length - 2) {
                        return `${formattedText} ${Localize.translate(preferredLocale, 'common.and')}`;
                    }
                    if (index < displayNamesWithTooltips.length - 2) {
                        return `${formattedText},`;
                    }
                }).join(' ');
        }

        result.alternateText = lastMessageText || formattedLogin;
    }

    result.isIOUReportOwner = ReportUtils.isIOUOwnedByCurrentUser(result);
    result.iouReportAmount = ReportUtils.getMoneyRequestTotal(result);

    if (!hasMultipleParticipants) {
        result.accountID = personalDetail.accountID;
        result.login = personalDetail.login;
        result.phoneNumber = personalDetail.phoneNumber;
        result.payPalMeAddress = personalDetail.payPalMeAddress;
    }

    const reportName = ReportUtils.getReportName(report, policy);

    result.text = reportName;
    result.subtitle = subtitle;
    result.participantsList = participantPersonalDetailList;

    result.icons = ReportUtils.getIcons(report, personalDetails, UserUtils.getAvatar(personalDetail.avatar, personalDetail.accountID), true, '', -1, policy);
    result.searchText = OptionsListUtils.getSearchText(report, reportName, participantPersonalDetailList, result.isChatRoom || result.isPolicyExpenseChat, result.isThread);
    result.displayNamesWithTooltips = displayNamesWithTooltips;
    result.isLastMessageDeletedParentAction = report.isLastMessageDeletedParentAction;
    return result;
}

export default {
    getOptionData,
    getOrderedReportIDs,
    setIsSidebarLoadedReady,
    isSidebarLoadedReady,
    resetIsSidebarLoadedReadyPromise,
};
