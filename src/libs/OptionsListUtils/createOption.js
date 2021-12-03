import _ from 'underscore';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import * as ReportUtils from '../reportUtils';
import * as store from './store';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Returns a string with all relevant search terms.
 * Default should be searchable by policy/domain name but not by participants.
 *
 * @param {Object} report
 * @param {Array} personalDetailList
 * @param {Boolean} isDefaultChatRoom
 * @return {String}
 */
function getSearchText(report, personalDetailList, isDefaultChatRoom) {
    const searchTerms = [];

    if (!isDefaultChatRoom) {
        _.each(personalDetailList, (personalDetail) => {
            searchTerms.push(personalDetail.displayName);
            searchTerms.push(personalDetail.login);
        });
    }
    if (report) {
        searchTerms.push(...report.reportName);
        searchTerms.push(..._.map(report.reportName.split(','), name => name.trim()));

        if (isDefaultChatRoom) {
            const defaultRoomSubtitle = ReportUtils.getDefaultRoomSubtitle(report, store.getPolicies());
            searchTerms.push(...defaultRoomSubtitle);
            searchTerms.push(..._.map(defaultRoomSubtitle.split(','), name => name.trim()));
        } else {
            searchTerms.push(...report.participants);
        }
    }

    return _.unique(searchTerms).join(' ');
}

/**
 * Creates a report list option
 *
 * @param {Array<Object>} personalDetailList
 * @param {Object} [report]
 * @param {Boolean} showChatPreviewLine
 * @param {Boolean} forcePolicyNamePreview
 * @returns {Object}
 */
function createOption(personalDetailList, report, {
    showChatPreviewLine = false, forcePolicyNamePreview = false,
}) {
    const isDefaultChatRoom = ReportUtils.isDefaultRoom(report);
    const hasMultipleParticipants = personalDetailList.length > 1 || isDefaultChatRoom;
    const personalDetail = personalDetailList[0];
    const hasDraftComment = ReportUtils.hasReportDraftComment(report);
    const hasOutstandingIOU = lodashGet(report, 'hasOutstandingIOU', false);
    const iouReport = hasOutstandingIOU
        ? lodashGet(store.getIOUReports(), `${ONYXKEYS.COLLECTION.REPORT_IOUS}${report.iouReportID}`, {})
        : {};

    const lastActorDetails = report ? _.find(personalDetailList, {login: report.lastActorEmail}) : null;
    const lastMessageText = report
        ? (hasMultipleParticipants && lastActorDetails
            ? `${lastActorDetails.displayName}: `
            : '')
        + Str.htmlDecode(report.lastMessageText)
        : '';

    const tooltipText = ReportUtils.getReportParticipantsTitle(lodashGet(report, ['participants'], []));

    let text;
    let alternateText;
    if (isDefaultChatRoom) {
        text = lodashGet(report, ['reportName'], '');
        alternateText = (showChatPreviewLine && !forcePolicyNamePreview && lastMessageText)
            ? lastMessageText
            : ReportUtils.getDefaultRoomSubtitle(report, store.getPolicies());
    } else {
        text = hasMultipleParticipants
            ? _.map(personalDetailList, ({firstName, login}) => firstName || Str.removeSMSDomain(login))
                .join(', ')
            : lodashGet(report, ['reportName'], personalDetail.displayName);
        alternateText = (showChatPreviewLine && lastMessageText)
            ? lastMessageText
            : Str.removeSMSDomain(personalDetail.login);
    }
    return {
        text,
        alternateText,
        icons: lodashGet(report, 'icons', [personalDetail.avatar]),
        tooltipText,
        participantsList: personalDetailList,

        // It doesn't make sense to provide a login in the case of a report with multiple participants since
        // there isn't any one single login to refer to for a report.
        login: !hasMultipleParticipants ? personalDetail.login : null,
        reportID: report ? report.reportID : null,
        phoneNumber: !hasMultipleParticipants ? personalDetail.phoneNumber : null,
        payPalMeAddress: !hasMultipleParticipants ? personalDetail.payPalMeAddress : null,
        isUnread: report ? report.unreadActionCount > 0 : null,
        hasDraftComment,
        keyForList: report ? String(report.reportID) : personalDetail.login,
        searchText: getSearchText(report, personalDetailList, isDefaultChatRoom),
        isPinned: lodashGet(report, 'isPinned', false),
        hasOutstandingIOU,
        iouReportID: lodashGet(report, 'iouReportID'),
        isIOUReportOwner: lodashGet(iouReport, 'ownerEmail', '') === store.getCurrentUserLogin(),
        iouReportAmount: lodashGet(iouReport, 'total', 0),
        isDefaultChatRoom,
        isArchivedRoom: ReportUtils.isArchivedRoom(report),
    };
}

export default createOption;
