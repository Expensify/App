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
// when IOUs change, it also triggers a change on the reports collection. Having redudant subscriptions causes more re-renders which should be avoided.
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

let currentlyViewedReportID;
Onyx.connect({
    key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
    callback: val => currentlyViewedReportID = val,
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
 * @returns {String[]} An array of reportIDs sorted in the proper order
 */
function getOrderedReportIDs() {
    let recentReportOptions = [];
    const pinnedReportOptions = [];
    const iouDebtReportOptions = [];
    const draftReportOptions = [];

    const isInGSDMode = priorityMode === CONST.PRIORITY_MODE.GSD;
    const isInDefaultMode = priorityMode === CONST.PRIORITY_MODE.DEFAULT;

    // Filter out all the reports that shouldn't be displayed
    const filteredReports = _.filter(reports, report => ReportUtils.shouldReportBeInOptionList(report, currentlyViewedReportID, isInGSDMode, currentUserLogin, iouReports, betas, policies));

    let orderedReports = _.sortBy(filteredReports, isInGSDMode ? 'reportName' : 'lastMessageTimestamp');

    // When the user is default mode, then the reports are ordered recently updated descending, so the ordered
    // array must be reversed or else the recently updated changes will be at the bottom and not the top
    if (isInDefaultMode) {
        orderedReports.reverse();
    }

    // Move the archived Rooms to the last
    orderedReports = _.sortBy(orderedReports, report => ReportUtils.isArchivedRoom(report));

    // Put all the reports into the different buckets
    for (let i = 0; i < orderedReports.length; i++) {
        const report = orderedReports[i];

        // If the report is pinned and we are using the option to display pinned reports on top then we need to
        // collect the pinned reports so we can sort them alphabetically once they are collected
        if (report.isPinned) {
            pinnedReportOptions.push(report);
        } else if (report.hasOutstandingIOU && !report.isIOUReportOwner) {
            iouDebtReportOptions.push(report);

        // If the active report has a draft, we do not put it in the group of draft reports because we want it to maintain it's current position. Otherwise the report's position
        // jumps around in the LHN and it's kind of confusing to the user to see the LHN reorder when they start typing a comment on a report.
        } else if (report.hasDraft && report.reportID.toString() !== currentlyViewedReportID) {
            draftReportOptions.push(report);
        } else {
            recentReportOptions.push(report);
        }
    }

    // Prioritizing reports with draft comments, add them before the normal recent report options
    // and sort them by report name.
    const sortedDraftReports = _.sortBy(draftReportOptions, (report) => {
        const personalDetailMap = OptionsListUtils.getPersonalDetailsForLogins(report.participants, personalDetails);
        return ReportUtils.getReportName(report, personalDetailMap, policies);
    });
    recentReportOptions = sortedDraftReports.concat(recentReportOptions);

    // Prioritizing IOUs the user owes, add them before the normal recent report options and reports
    // with draft comments.
    const sortedIOUReports = _.sortBy(iouDebtReportOptions, 'iouReportAmount').reverse();
    recentReportOptions = sortedIOUReports.concat(recentReportOptions);

    // If we are prioritizing our pinned reports then shift them to the front and sort them by report name
    const sortedPinnedReports = _.sortBy(pinnedReportOptions, (report) => {
        const personalDetailMap = OptionsListUtils.getPersonalDetailsForLogins(report.participants, personalDetails);
        return ReportUtils.getReportName(report, personalDetailMap, policies);
    });
    recentReportOptions = sortedPinnedReports.concat(recentReportOptions);

    return _.chain(recentReportOptions)
        .pluck('reportID')
        .map(reportID => reportID.toString())
        .value();
}

/**
 * Gets all the data necessary for rendering an OptionRowLHN component
 *
 * @param {String} reportID
 * @returns {Object}
 */
function getOptionData(reportID) {
    const report = reports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    if (!report) {
        return;
    }
    const result = {
        text: null,
        alternateText: null,
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
    const personalDetail = personalDetailList[0];

    result.isChatRoom = ReportUtils.isChatRoom(report);
    result.isArchivedRoom = ReportUtils.isArchivedRoom(report);
    result.isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(report);
    result.shouldShowSubscript = result.isPolicyExpenseChat && !report.isOwnPolicyExpenseChat && !result.isArchivedRoom;
    result.brickRoadIndicator = OptionsListUtils.getBrickRoadIndicatorStatusForReport(report, reportActions);
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

    const reportName = ReportUtils.getReportName(report, personalDetailMap, policies);
    result.text = reportName;
    result.subtitle = subtitle;
    result.participantsList = personalDetailList;
    result.icons = ReportUtils.getIcons(report, personalDetails, policies, personalDetail.avatar);
    result.searchText = OptionsListUtils.getSearchText(report, reportName, personalDetailList, result.isChatRoom || result.isPolicyExpenseChat);

    return result;
}

export default {
    getOptionData,
    getOrderedReportIDs,
};
