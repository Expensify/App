import Onyx from 'react-native-onyx';
import _ from 'underscore';
import lodashOrderBy from 'lodash/orderBy';
import Str from 'expensify-common/lib/str';
import ONYXKEYS from '../ONYXKEYS';
import * as ReportUtils from './ReportUtils';
import * as Localize from './Localize';
import CONST from '../CONST';
import * as OptionsListUtils from './OptionsListUtils';
import * as CollectionUtils from './CollectionUtils';

// Note: It is very important that the keys subscribed to here are the same
// keys that are connected to SidebarLinks withOnyx(). If there was a key missing from SidebarLinks and it's data was updated
// for that key, then there would be no re-render and the options wouldn't reflect the new data because SidebarUtils.getOrderedReportIDs() wouldn't be triggered.
// There are a couple of keys here which are OK to have stale data. iouReports for example, doesn't need to exist in withOnyx() because
// when IOUs change, it also triggers a change on the reports collection. Having redundant subscriptions causes more re-renders which should be avoided.
// Session also can remain stale because the only way for the current user to change is to sign out and sign in, which would clear out all the Onyx
// data anyway and cause SidebarLinks to rerender.

const chatReports = {};
const iouReports = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: (report, key) => {
        if (!report) {
            delete iouReports[key];
            delete chatReports[key];
        } else if (ReportUtils.isIOUReport(report)) {
            iouReports[key] = report;
        } else {
            chatReports[key] = report;
        }
    },
});

let personalDetails;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS,
    callback: val => personalDetails = val,
});

let priorityMode;
Onyx.connect({
    key: ONYXKEYS.NVP_PRIORITY_MODE,
    callback: val => priorityMode = val,
});

let betas;
Onyx.connect({
    key: ONYXKEYS.BETAS,
    callback: val => betas = val,
});

const lastReportActions = {};
const reportActions = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    callback: (actions, key) => {
        if (!key || !actions) {
            return;
        }
        const reportID = CollectionUtils.extractCollectionItemID(key);
        lastReportActions[reportID] = _.last(_.toArray(actions));
        reportActions[key] = actions;
    },
});

let policies;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: val => policies = val,
});

let currentUserLogin;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: val => currentUserLogin = val,
});

let preferredLocale;
Onyx.connect({
    key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    callback: val => preferredLocale = val || CONST.DEFAULT_LOCALE,
});

/**
 * @param {String} reportIDFromRoute
 * @returns {String[]} An array of reportIDs sorted in the proper order
 */
function getOrderedReportIDs(reportIDFromRoute) {
    const isInGSDMode = priorityMode === CONST.PRIORITY_MODE.GSD;
    const isInDefaultMode = !isInGSDMode;

    // Filter out all the reports that shouldn't be displayed
    const reportsToDisplay = _.filter(chatReports, report => ReportUtils.shouldReportBeInOptionList(report, reportIDFromRoute, isInGSDMode, currentUserLogin, iouReports, betas, policies));

    // There are a few properties that need to be calculated for the report which are used when sorting reports.
    _.each(reportsToDisplay, (report) => {
        // Normally, the spread operator would be used here to clone the report and prevent the need to reassign the params.
        // However, this code needs to be very performant to handle thousands of reports, so in the interest of speed, we're just going to disable this lint rule and add
        // the reportDisplayName property to the report object directly.
        // eslint-disable-next-line no-param-reassign
        report.displayName = ReportUtils.getReportName(report, policies);

        // eslint-disable-next-line no-param-reassign
        report.iouReportAmount = ReportUtils.getIOUTotal(report, iouReports);
    });

    // The LHN is split into five distinct groups, and each group is sorted a little differently. The groups will ALWAYS be in this order:
    // 1. Pinned - Always sorted by reportDisplayName
    // 2. Outstanding IOUs - Always sorted by iouReportAmount with the largest amounts at the top of the group
    // 3. Drafts - Always sorted by reportDisplayName
    // 4. Non-archived reports
    //      - Sorted by lastActionCreated in default (most recent) view mode
    //      - Sorted by reportDisplayName in GSD (focus) view mode
    // 5. Archived reports
    //      - Sorted by lastActionCreated in default (most recent) view mode
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

        if (report.hasOutstandingIOU && !report.isIOUReportOwner) {
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
    pinnedReports = _.sortBy(pinnedReports, report => report.displayName.toLowerCase());
    outstandingIOUReports = lodashOrderBy(outstandingIOUReports, ['iouReportAmount', report => report.displayName.toLowerCase()], ['desc', 'asc']);
    draftReports = _.sortBy(draftReports, report => report.displayName.toLowerCase());
    nonArchivedReports = isInDefaultMode
        ? lodashOrderBy(nonArchivedReports, ['lastActionCreated', report => report.displayName.toLowerCase()], ['desc', 'asc'])
        : lodashOrderBy(nonArchivedReports, [report => report.displayName.toLowerCase()], ['asc']);
    archivedReports = _.sortBy(archivedReports, report => (isInDefaultMode ? report.lastActionCreated : report.displayName.toLowerCase()));

    // For archived reports ensure that most recent reports are at the top by reversing the order of the arrays because underscore will only sort them in ascending order
    if (isInDefaultMode) {
        archivedReports.reverse();
    }

    // Now that we have all the reports grouped and sorted, they must be flattened into an array and only return the reportID.
    // The order the arrays are concatenated in matters and will determine the order that the groups are displayed in the sidebar.
    return _.pluck([]
        .concat(pinnedReports)
        .concat(outstandingIOUReports)
        .concat(draftReports)
        .concat(nonArchivedReports)
        .concat(archivedReports), 'reportID');
}

/**
 * Gets all the data necessary for rendering an OptionRowLHN component
 *
 * @param {String} reportID
 * @returns {Object}
 */
function getOptionData(reportID) {
    const report = chatReports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];

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
        ownerEmail: null,
        subtitle: null,
        participantsList: null,
        login: null,
        reportID: null,
        phoneNumber: null,
        payPalMeAddress: null,
        isUnread: null,
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
    };

    const personalDetailMap = OptionsListUtils.getPersonalDetailsForLogins(report.participants, personalDetails);
    const personalDetailList = _.values(personalDetailMap);
    const personalDetail = personalDetailList[0] || {};

    result.isChatRoom = ReportUtils.isChatRoom(report);
    result.isArchivedRoom = ReportUtils.isArchivedRoom(report);
    result.isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(report);
    result.shouldShowSubscript = result.isPolicyExpenseChat && !report.isOwnPolicyExpenseChat && !result.isArchivedRoom;
    result.pendingAction = report.pendingFields ? (report.pendingFields.addWorkspaceRoom || report.pendingFields.createChat) : null;
    result.allReportErrors = OptionsListUtils.getAllReportErrors(report, reportActions);
    result.brickRoadIndicator = !_.isEmpty(result.allReportErrors) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
    result.ownerEmail = report.ownerEmail;
    result.reportID = report.reportID;
    result.isUnread = ReportUtils.isUnread(report);
    result.hasDraftComment = report.hasDraft;
    result.isPinned = report.isPinned;
    result.iouReportID = report.iouReportID;
    result.keyForList = String(report.reportID);
    result.tooltipText = ReportUtils.getReportParticipantsTitle(report.participants || []);
    result.hasOutstandingIOU = report.hasOutstandingIOU;

    const hasMultipleParticipants = personalDetailList.length > 1 || result.isChatRoom || result.isPolicyExpenseChat;
    const subtitle = ReportUtils.getChatRoomSubtitle(report, policies);

    // We only create tooltips for the first 10 users or so since some reports have hundreds of users, causing performance to degrade.
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips((personalDetailList || []).slice(0, 10), hasMultipleParticipants);

    let lastMessageTextFromReport = '';
    if (ReportUtils.isReportMessageAttachment({text: report.lastMessageText, html: report.lastMessageHtml})) {
        lastMessageTextFromReport = `[${Localize.translateLocal('common.attachment')}]`;
    } else {
        lastMessageTextFromReport = Str.htmlDecode(report ? report.lastMessageText : '');
    }

    const lastActorDetails = personalDetailMap[report.lastActorEmail] || null;
    let lastMessageText = hasMultipleParticipants && lastActorDetails && (lastActorDetails.login !== currentUserLogin.email)
        ? `${lastActorDetails.displayName}: `
        : '';
    lastMessageText += report ? lastMessageTextFromReport : '';

    if (result.isPolicyExpenseChat && result.isArchivedRoom) {
        const archiveReason = (lastReportActions[report.reportID] && lastReportActions[report.reportID].originalMessage && lastReportActions[report.reportID].originalMessage.reason)
            || CONST.REPORT.ARCHIVE_REASON.DEFAULT;
        lastMessageText = Localize.translate(preferredLocale, `reportArchiveReasons.${archiveReason}`, {
            displayName: archiveReason.displayName || report.lastActorEmail,
            policyName: ReportUtils.getPolicyName(report, policies),
        });
    }

    if (result.isChatRoom || result.isPolicyExpenseChat) {
        result.alternateText = lastMessageText || subtitle;
    } else {
        if (hasMultipleParticipants && !lastMessageText) {
            // Here we get the beginning of chat history message and append the display name for each user, adding pronouns if there are any.
            // We also add a fullstop after the final name, the word "and" before the final name and commas between all previous names.
            lastMessageText = Localize.translate(preferredLocale, 'reportActionsView.beginningOfChatHistory')
                + _.map(displayNamesWithTooltips, ({displayName, pronouns}, index) => {
                    const formattedText = _.isEmpty(pronouns) ? displayName : `${displayName} (${pronouns})`;

                    if (index === displayNamesWithTooltips.length - 1) { return `${formattedText}.`; }
                    if (index === displayNamesWithTooltips.length - 2) { return `${formattedText} ${Localize.translate(preferredLocale, 'common.and')}`; }
                    if (index < displayNamesWithTooltips.length - 2) { return `${formattedText},`; }
                }).join(' ');
        }

        result.alternateText = lastMessageText || Str.removeSMSDomain(personalDetail.login);
    }

    result.isIOUReportOwner = ReportUtils.isIOUOwnedByCurrentUser(result, currentUserLogin, iouReports);
    result.iouReportAmount = ReportUtils.getIOUTotal(result, iouReports);

    if (!hasMultipleParticipants) {
        result.login = personalDetail.login;
        result.phoneNumber = personalDetail.phoneNumber;
        result.payPalMeAddress = personalDetail.payPalMeAddress;
    }

    const reportName = ReportUtils.getReportName(report, policies);
    result.text = reportName;
    result.subtitle = subtitle;
    result.participantsList = personalDetailList;
    result.icons = ReportUtils.getIcons(report, personalDetails, policies, personalDetail.avatar);
    result.searchText = OptionsListUtils.getSearchText(report, reportName, personalDetailList, result.isChatRoom || result.isPolicyExpenseChat);
    result.displayNamesWithTooltips = displayNamesWithTooltips;

    return result;
}

export default {
    getOptionData,
    getOrderedReportIDs,
};
