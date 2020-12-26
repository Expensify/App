/* eslint-disable no-continue */
import _ from 'underscore';
import lodashGet from 'lodash.get';
import lodashOrderBy from 'lodash.orderby';
import Str from 'expensify-common/lib/str';
import {getDefaultAvatar} from './actions/PersonalDetails';
import ONYXKEYS from '../ONYXKEYS';

function reportHasMultipleParticipants(report) {
    return lodashGet(report, 'participants', []).length > 1;
}

function isUserReportParticipant(report, login) {
    const participants = lodashGet(report, 'participants', []);
    return _.some(participants, participantLogin => participantLogin === login);
}

function getParticipantLogins(report) {
    return lodashGet(report, ['participants'], []);
}

/**
 * Check if the report has a draft comment
 *
 * @param {Object} comments
 * @param {Number} reportID
 * @returns {Boolean}
 */
function hasComment(comments, reportID) {
    const allComments = lodashGet(comments, `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`, '');
    return allComments.length > 0;
}

/**
 * Array of personal details to create a chat option out of
 *
 * @param {Array<Object>} personalDetailList
 * @param {Object} [report]
 * @param {Object} [comments]
 * @param {Number} [activeReportID]
 * @returns {Object}
 */
function createChatOption(personalDetailList, report, comments, activeReportID) {
    // There is only one participant so return the single participant view
    const personalDetail = personalDetailList[0];
    const isSingleUserDM = personalDetailList.length < 2;
    return {
        text: report ? report.reportName : personalDetail.displayName,
        alternateText: (!report || isSingleUserDM) ? personalDetail.login : report.reportName,
        icon: report ? report.icon : personalDetail.avatarURL,
        login: personalDetailList.length < 2 ? personalDetail.login : null,
        reportID: report ? report.reportID : null,
        isUnread: report ? report.unreadActionCount > 0 : null,
        hasDraftComment: report && report.reportID !== activeReportID && hasComment(comments, report.reportID),
        keyForList: report ? String(report.reportID) : personalDetail.login,
    };
}

function isSearchStringMatch(searchValue, searchText) {
    const matchRegexes = [
        new RegExp(`^${Str.escapeForRegExp(searchValue)}$`, 'i'),
        new RegExp(`^${Str.escapeForRegExp(searchValue)}`, 'i'),
        new RegExp(Str.escapeForRegExp(searchValue), 'i'),
    ];

    return _.some(matchRegexes, (regex) => {
        const valueToSearch = searchText && searchText.replace(new RegExp(/&nbsp;/g), '');
        return regex.test(valueToSearch);
    });
}

function getChatListOptions(personalDetails = {}, reports = {}, comments = {}, {
    selectedOptions = [],
    numberOfRecentChatsToShow = 0,
    includeGroupChats = false,
    includeContacts = false,
    includeRecentChats = false,
    showPinnedChatsOnTop = false,
    searchValue = '',
    activeReportID = null,
}) {
    // Start by getting specified n most recent users that are not already selected
    const orderedReports = lodashOrderBy(reports, ['lastVisitedTimestamp'], ['desc']);
    let recentChats = [];
    const pinnedChats = [];
    const contacts = [];
    const loginsToExclude = [...selectedOptions];

    if (includeRecentChats) {
        for (let i = 0; i < orderedReports.length; i++) {
            const report = orderedReports[i];

            if (recentChats.length === numberOfRecentChatsToShow) {
                break;
            }

            // Skip any reports where there are multiple users if we are not including group chats
            const hasMultipleParticipants = reportHasMultipleParticipants(report);

            if (!includeGroupChats && hasMultipleParticipants) {
                continue;
            }

            // Check the report to see if it has a single user and that user is already selected
            if (!hasMultipleParticipants
                    && _.some(loginsToExclude, option => isUserReportParticipant(report, option.login))
            ) {
                continue;
            }

            // Finally check to see if this options is a match for the provided search string if we have one
            const searchText = report.participants < 10
                ? `${report.reportName} ${report.participants.join(' ')}`
                : report.reportName ?? '';

            if (searchValue && !isSearchStringMatch(searchValue, searchText)) {
                continue;
            }

            const logins = getParticipantLogins(report);
            const reportPersonalDetails = _.map(logins, (login) => {
                let personalDetail = personalDetails[login];

                if (!personalDetail) {
                    personalDetail = {
                        login,
                        displayName: login,
                        avatarURL: getDefaultAvatar(login),
                    };
                }

                return personalDetail;
            });

            const chatOption = createChatOption(reportPersonalDetails, report, comments, activeReportID);

            // If the report is pinned and we are using the option to display pinned chats on top then we need to
            // collect the pinned chats so we can sort them alphabetically once they are collected
            if (showPinnedChatsOnTop && report.isPinned) {
                pinnedChats.push(chatOption);
            } else {
                recentChats.push(chatOption);
            }

            // If we are not including group chats in our recent chats list
            // then we will add this login to the exclude list so it won't appear
            // in the contacts group
            if (logins.length === 1) {
                loginsToExclude.push(logins[0]);
            }
        }
    }

    if (showPinnedChatsOnTop) {
        const sortedPinnedChats = lodashOrderBy(pinnedChats, ['reportName'], ['asc']);
        recentChats = sortedPinnedChats.concat(recentChats);
    }

    if (includeContacts) {
        // Next loop over all personal details removing any that are selectedUsers or recentChats
        _.each(personalDetails, (personalDetail, login) => {
            if (_.some(loginsToExclude, loginToExclude => loginToExclude === login)) {
                return;
            }

            const searchText = personalDetail.displayName === personalDetail.login
                ? personalDetail.login
                : `${personalDetail.displayName} ${personalDetail.login}`;

            if (searchValue && !isSearchStringMatch(searchValue, searchText)) {
                return;
            }

            contacts.push(createChatOption([personalDetail]));
        });
    }

    return {
        contacts,
        recentChats,
    };
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getChatListOptions,
};
