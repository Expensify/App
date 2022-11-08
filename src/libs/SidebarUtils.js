import Onyx from 'react-native-onyx';
import _ from 'underscore';
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

let reports;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: val => reports = val,
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

let iouReports;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_IOUS,
    waitForCollectionCallback: true,
    callback: val => iouReports = val,
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
    let recentReportOptions = [];
    const pinnedReportOptions = [];
    const iouDebtReportOptions = [];
    const draftReportOptions = [];

    const isInGSDMode = priorityMode === CONST.PRIORITY_MODE.GSD;
    const isInDefaultMode = !isInGSDMode;

    // Filter out all the reports that shouldn't be displayed
    const reportsToDisplay = _.filter(reports, report => ReportUtils.shouldReportBeInOptionList(report, reportIDFromRoute, isInGSDMode, currentUserLogin, iouReports, betas, policies));

    // Get all the display names for our reports in an easy to access property so we don't have to keep
    // re-running the logic
    _.each(reportsToDisplay, (report) => {
        // Normally, the spread operator would be used here to clone the report and prevent the need to reassign the params.
        // However, this code needs to be very performant to handle thousands of reports, so in the interest of speed, we're just going to disable this lint rule and add
        // the reportDisplayName property to the report object directly.
        // eslint-disable-next-line no-param-reassign
        report.reportDisplayName = ReportUtils.getReportName(report, policies);
    });

    // The LHN is split into five distinct groups, and each group is sorted a little differently. The groups will ALWAYS be in this order:
    // 1. Pinned - Always sorted by reportDisplayName
    // 2. Outstanding IOUs - Always sorted by iouReportAmount with the largest amounts at the top of the group
    // 3. Drafts - Always sorted by reportDisplayName
    // 4. Non-archived reports
    //      - Sorted by lastMessageTimestamp in default (most recent) view mode
    //      - Sorted by reportDisplayName in GSD (focus) view mode
    // 5. Archived reports
    //      - Sorted by lastMessageTimestamp in default (most recent) view mode
    //      - Sorted by reportDisplayName in GSD (focus) view mode

    // Put all of the reports into their groups
    const reportGroups = _.groupBy(reportsToDisplay, (report) => {
        if (report.isPinned) {
            return 'isPinned';
        }

        if (report.hasOutstandingIOU && !report.isIOUReportOwner) {
            return 'hasOutstandingIOU';
        }

        if (report.hasDraft) {
            return 'hasDraft';
        }

        if (ReportUtils.isArchivedRoom(report)) {
            return 'archived';
        }

        return 'nonArchived';
    });

    // Now we can sort each group accordingly
    const sortedGroups = {};
    _.each(reportGroups, (reportGroup, groupName) => {
        let sortedGroup;
        switch (groupName) {
            case 'hasOutstandingIOU':
                sortedGroup = _.sortBy(reportGroup, 'iouReportAmount').reverse();
                break;

            case 'isPinned':
            case 'hasDraft':
                sortedGroup = _.sortBy(reportGroup, 'reportDisplayName');
                break;

            case 'archived':
            case 'nonArchived':
                sortedGroup = _.sortBy(reportGroup, isInDefaultMode ? 'lastMessageTimestamp' : 'reportDisplayName');
                if (isInDefaultMode) {
                    sortedGroup.reverse();
                }
                break;

            default:
                break;
        }

        // The sorted groups only need to contain the reportID because that's all that needs returned from getOrderedReportIDs()
        sortedGroups[groupName] = _.pluck(sortedGroup, 'reportID');
    });

    // Now that we have all the report IDs grouped and sorted, they must be flattened into an array to be returned
    return []
        .concat(sortedGroups.isPinned || [])
        .concat(sortedGroups.hasOutstandingIOU || [])
        .concat(sortedGroups.hasDraft || [])
        .concat(sortedGroups.nonArchived || [])
        .concat(sortedGroups.archived || []);

    // Sorting the reports works like this:
    // - When in default mode, reports will be ordered by most recently updated (in descending order) so that the most recently updated are at the top
    // - When in GSD mode, reports are ordered by their display name so they are alphabetical (in ascending order)
    // - Regardless of mode, all archived reports should remain at the bottom
    const orderedReports = _.sortBy(reportsToDisplay, (report) => {
        if (ReportUtils.isArchivedRoom(report)) {
            return isInDefaultMode

                // -Infinity is used here because there is no chance that a report will ever have an older timestamp than -Infinity and it ensures that archived reports
                // will always be listed last
                ? -Infinity

                // Similar logic is used for 'ZZZZZZZZZZZZZ' to reasonably assume that no report will ever have a report name that will be listed alphabetically after this, ensuring that
                // archived reports will be listed last
                : 'ZZZZZZZZZZZZZ';
        }

        return isInDefaultMode ? report.lastMessageTimestamp : report.reportDisplayName;
    });

    // Apply the descending order to reports when in default mode
    if (isInDefaultMode) {
        orderedReports.reverse();
    }

    // Put all the reports into the different buckets
    for (let i = 0; i < orderedReports.length; i++) {
        const report = orderedReports[i];

        // If the report is pinned and we are using the option to display pinned reports on top then we need to
        // collect the pinned reports so we can sort them alphabetically once they are collected
        if (report.isPinned) {
            pinnedReportOptions.push(report);
        } else if (report.hasOutstandingIOU && !report.isIOUReportOwner) {
            iouDebtReportOptions.push(report);
        } else if (report.hasDraft) {
            draftReportOptions.push(report);
        } else {
            recentReportOptions.push(report);
        }
    }

    // Prioritizing reports with draft comments, add them before the normal recent report options
    // and sort them by report name.
    const sortedDraftReports = _.sortBy(draftReportOptions, 'reportDisplayName');
    recentReportOptions = sortedDraftReports.concat(recentReportOptions);

    // Prioritizing IOUs the user owes, add them before the normal recent report options and reports
    // with draft comments.
    const sortedIOUReports = _.sortBy(iouDebtReportOptions, 'iouReportAmount').reverse();
    recentReportOptions = sortedIOUReports.concat(recentReportOptions);

    // If we are prioritizing our pinned reports then shift them to the front and sort them by report name
    const sortedPinnedReports = _.sortBy(pinnedReportOptions, 'reportDisplayName');
    recentReportOptions = sortedPinnedReports.concat(recentReportOptions);

    return _.pluck(recentReportOptions, 'reportID');
}

/**
 * Gets all the data necessary for rendering an OptionRowLHN component
 *
 * @param {String} reportID
 * @returns {Object}
 */
function getOptionData(reportID) {
    const report = reports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];

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
    let lastMessageText = hasMultipleParticipants && lastActorDetails
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

    if (result.hasOutstandingIOU) {
        const iouReport = (iouReports && iouReports[`${ONYXKEYS.COLLECTION.REPORT_IOUS}${report.iouReportID}`]) || null;
        if (iouReport) {
            result.isIOUReportOwner = iouReport.ownerEmail === currentUserLogin;
            result.iouReportAmount = iouReport.total;
        }
    }

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
