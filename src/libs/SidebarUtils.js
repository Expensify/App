import Onyx from 'react-native-onyx';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import ONYXKEYS from '../ONYXKEYS';
import * as ReportUtils from './ReportUtils';
import * as Localize from './Localize';
import CONST from '../CONST';
import * as OptionsListUtils from './OptionsListUtils';
import * as CollectionUtils from './CollectionUtils';
import Permissions from './Permissions';

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
    key: ONYXKEYS.NVP_PRIORITY_MODE,
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
    const hideReadReports = priorityMode === CONST.PRIORITY_MODE.GSD;
    const sortByTimestampDescending = priorityMode !== CONST.PRIORITY_MODE.GSD;

    let recentReportOptions = [];
    const pinnedReportOptions = [];
    const iouDebtReportOptions = [];
    const draftReportOptions = [];

    const filteredReports = _.filter(reports, (report) => {
        if (!report || !report.reportID) {
            return false;
        }

        const isChatRoom = ReportUtils.isChatRoom(report);
        const isDefaultRoom = ReportUtils.isDefaultRoom(report);
        const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(report);
        const participants = (report && report.participants) || [];

        // Skip this report if it has no participants and if it's not a type of report supported in the LHN
        if (_.isEmpty(participants) && !isChatRoom && !isDefaultRoom && !isPolicyExpenseChat) {
            return false;
        }

        const hasDraftComment = report.hasDraft || false;
        const iouReport = report.iouReportID && iouReports && iouReports[`${ONYXKEYS.COLLECTION.REPORT_IOUS}${report.iouReportID}`];
        const iouReportOwner = report.hasOutstandingIOU && iouReport
            ? iouReport.ownerEmail
            : '';

        const reportContainsIOUDebt = iouReportOwner && iouReportOwner !== currentUserLogin;
        const shouldFilterReportIfEmpty = report.lastMessageTimestamp === 0

            // We make exceptions for defaultRooms and policyExpenseChats so we can immediately
            // highlight them in the LHN when they are created and have no messsages yet. We do
            // not give archived rooms this exception since they do not need to be higlihted.
            && !(!ReportUtils.isArchivedRoom(report) && (isDefaultRoom || isPolicyExpenseChat));

        const shouldFilterReportIfRead = hideReadReports && report.unreadActionCount === 0;
        const shouldFilterReport = shouldFilterReportIfEmpty || shouldFilterReportIfRead;
        if (report.reportID.toString() !== currentlyViewedReportID.toString()
            && !report.isPinned
            && !hasDraftComment
            && shouldFilterReport
            && !reportContainsIOUDebt) {
            return false;
        }

        // We let Free Plan default rooms to be shown in the App - it's the one exception to the beta, otherwise do not show policy rooms in product
        if (ReportUtils.isDefaultRoom(report) && !Permissions.canUseDefaultRooms(betas) && ReportUtils.getPolicyType(report, policies) !== CONST.POLICY.TYPE.FREE) {
            return false;
        }

        if (ReportUtils.isUserCreatedPolicyRoom(report) && !Permissions.canUsePolicyRooms(betas)) {
            return false;
        }

        if (isPolicyExpenseChat && !Permissions.canUsePolicyExpenseChat(betas)) {
            return false;
        }

        return true;
    });

    let orderedReports = _.sortBy(filteredReports, sortByTimestampDescending ? 'lastMessageTimestamp' : 'reportName');

    if (sortByTimestampDescending) {
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
        } else if (report.hasDraft) {
            draftReportOptions.push(report);
        } else {
            recentReportOptions.push(report);
        }
    }

    // Prioritizing reports with draft comments, add them before the normal recent report options
    // and sort them by report name.
    const sortedDraftReports = _.sortBy(draftReportOptions, 'text');
    recentReportOptions = sortedDraftReports.concat(recentReportOptions);

    // Prioritizing IOUs the user owes, add them before the normal recent report options and reports
    // with draft comments.
    const sortedIOUReports = _.sortBy(iouDebtReportOptions, 'iouReportAmount').reverse();
    recentReportOptions = sortedIOUReports.concat(recentReportOptions);

    // If we are prioritizing our pinned reports then shift them to the front and sort them by report name
    const sortedPinnedReports = _.sortBy(pinnedReportOptions, 'text');
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
