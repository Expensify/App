import Onyx from 'react-native-onyx';
import _ from 'underscore/underscore-node';
import Str from 'expensify-common/lib/str';
import ONYXKEYS from '../ONYXKEYS';
import * as ReportUtils from './ReportUtils';
import * as Localize from './Localize';
import CONST from '../CONST';
import * as OptionsListUtils from './OptionsListUtils';
import * as CollectionUtils from './CollectionUtils';

let reports;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: val => reports = val,
});

let personalDetails;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS,
    callback: val => personalDetails = val,
});

// let currentlyViewedReportID;
// Onyx.connect({
//     key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
//     callback: val => currentlyViewedReportID = val,
// });
//
// let priorityMode;
// Onyx.connect({
//     key: ONYXKEYS.NVP_PRIORITY_MODE,
//     callback: val => priorityMode = val,
// });
//
// let betas;
// Onyx.connect({
//     key: ONYXKEYS.NVP_PRIORITY_MODE,
//     callback: val => betas = val,
// });

const lastReportActions = {};
let reportActions;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    callback: (actions, key) => {
        reportActions = actions;
        if (!key || !actions) {
            return;
        }
        const reportID = CollectionUtils.extractCollectionItemID(key);
        lastReportActions[reportID] = _.last(_.toArray(actions));
    },
});

const policies = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    callback: (policy, key) => {
        if (!policy || !key || !policy.name) {
            return;
        }

        policies[key] = policy;
    },
});

const iouReports = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_IOUS,
    callback: (iouReport, key) => {
        if (!iouReport || !key || !iouReport.ownerEmail) {
            return;
        }

        iouReports[key] = iouReport;
    },
});

let currentUserLogin;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: val => currentUserLogin = val,
});

// let loginList;
// Onyx.connect({
//     key: ONYXKEYS.LOGIN_LIST,
//     callback: val => loginList = val,
// });

let preferredLocale;
Onyx.connect({
    key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    callback: val => preferredLocale = val || CONST.DEFAULT_LOCALE,
});

/**
 * Gets all the data necessary for rendering an OptionRowLHN component
 *
 * @param {String} reportID
 * @returns {Object}
 */
function getOptionData(reportID) {
    const report = reports[reportID];
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
    let hasMultipleParticipants = personalDetailList.length > 1;

    result.isChatRoom = ReportUtils.isChatRoom(report);
    result.isArchivedRoom = ReportUtils.isArchivedRoom(report);
    result.isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(report);
    result.shouldShowSubscript = result.isPolicyExpenseChat && !report.isOwnPolicyExpenseChat && !result.isArchivedRoom;
    result.brickRoadIndicator = OptionsListUtils.getBrickRoadIndicatorStatusForReport(report, reportActions);
    result.ownerEmail = report.ownerEmail;
    result.reportID = report.reportID;
    result.isUnread = report.unreadActionCount > 0;
    result.hasDraftComment = report.hasDraft;
    result.isPinned = report.isPinned;
    result.iouReportID = report.iouReportID;
    result.keyForList = String(report.reportID);
    result.tooltipText = ReportUtils.getReportParticipantsTitle(report.participants || []);
    result.hasOutstandingIOU = report.hasOutstandingIOU;

    hasMultipleParticipants = personalDetailList.length > 1 || result.isChatRoom || result.isPolicyExpenseChat;
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
        const iouReport = iouReports[`${ONYXKEYS.COLLECTION.REPORT_IOUS}${report.iouReportID}`] || null;
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

export default {getOptionData};
