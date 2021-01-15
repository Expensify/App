/* eslint-disable no-continue */
import _ from 'underscore';
import lodashGet from 'lodash.get';
import lodashOrderBy from 'lodash.orderby';
import Str from 'expensify-common/lib/str';
import {getDefaultAvatar} from './actions/PersonalDetails';
import ONYXKEYS from '../ONYXKEYS';

/**
 * ReportListUtils is used to build a list options passed to the ReportList component. Several different UI views can
 * be configured to display different results based on the options passed to the private getOptions() method. Public
 * methods should be named for the views they build options for and then exported for use in a component.
 */

/**
 * Get participants for the report. Returns array of logins.
 *
 * @param {Object} report
 * @returns {Array}
 */
function getParticipantLogins(report) {
    return lodashGet(report, ['participants'], []);
}

/**
 * Does the report have multiple participants?
 *
 * @param {Object} report
 * @returns {Boolean}
 */
function reportHasMultipleParticipants(report) {
    return getParticipantLogins(report).length > 1;
}

/**
 * Is the login provided a report participant?
 *
 * @param {Object} report
 * @param {String} login
 * @returns {Boolean}
 */
function isUserReportParticipant(report, login) {
    return _.some(getParticipantLogins(report), participantLogin => participantLogin === login);
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
 * Creates a report list option
 *
 * @param {Array<Object>} personalDetailList
 * @param {Object} [report]
 * @param {Object} [comments]
 * @param {Number} [activeReportID]
 * @returns {Object}
 */
function createOption(personalDetailList, report, comments, activeReportID) {
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

/**
 * Build the options
 *
 * @param {Object} reports
 * @param {Object} personalDetails
 * @param {Object} reportActions
 * @param {Object} options
 * @returns {Object}
 * @private
 */
function getOptions(reports, personalDetails = {}, reportActions = {}, {
    selectedOptions = [],
    maxRecentReportsToShow = 0,
    includeMultipleParticipantReports = false,
    includePersonalDetails = false,
    includeRecentReports = false,
    prioritizePinnedReports = false,
    searchValue = '',
    activeReportID = null,
}) {
    // Start by getting specified n most recent users that are not already selected
    const orderedReports = lodashOrderBy(reports, ['lastVisitedTimestamp'], ['desc']);
    let recentReportOptions = [];
    const pinnedReports = [];
    const personalDetailsOptions = [];
    const loginsToExclude = [...selectedOptions];
    const reportMapForLogins = {};

    for (let i = 0; i < orderedReports.length; i++) {
        const report = orderedReports[i];
        const hasMultipleParticipants = reportHasMultipleParticipants(report);
        const logins = getParticipantLogins(report);

        // If we are including personalDetails but not reports then save the reportID so we can
        // reference it later when building the personalDetails options.
        if (!hasMultipleParticipants && includePersonalDetails && !includeRecentReports) {
            reportMapForLogins[logins[0]] = report;
        }

        if (recentReportOptions.length > 0 && recentReportOptions.length === maxRecentReportsToShow) {
            break;
        }

        if (!includeRecentReports) {
            continue;
        }

        if (!includeMultipleParticipantReports && hasMultipleParticipants) {
            continue;
        }

        // Check the report to see if it has a single user and that the user is already selected
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

        const option = createOption(reportPersonalDetails, report, reportActions, activeReportID);

        // If the report is pinned and we are using the option to display pinned reports on top then we need to
        // collect the pinned reports so we can sort them alphabetically once they are collected
        if (prioritizePinnedReports && report.isPinned) {
            pinnedReports.push(option);
        } else {
            recentReportOptions.push(option);
        }

        // If we are not including reports with multiple participants in our recent reports list
        // then we will add this login to the exclude list so it won't appear
        // when we process the personal details
        if (logins.length === 1) {
            loginsToExclude.push(logins[0]);
        }
    }

    if (prioritizePinnedReports) {
        const sortedPinnedReports = lodashOrderBy(pinnedReports, ['reportName'], ['asc']);
        recentReportOptions = sortedPinnedReports.concat(recentReportOptions);
    }

    if (includePersonalDetails) {
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

            personalDetailsOptions.push(createOption([personalDetail], reportMapForLogins[personalDetail.login]));
        });
    }

    return {
        personalDetails: personalDetailsOptions,
        recentReports: recentReportOptions,
    };
}

/**
 * Build the options for the Search view
 *
 * @param {Object} reports
 * @param {Object} reportActions
 * @param {String} searchValue
 * @returns {Object}
 */
function getSearchOptions(reports, reportActions, searchValue = '') {
    return getOptions(reports, {}, reportActions, {
        searchValue,
        includeRecentReports: true,
        includeMultipleParticipantReports: true,
        maxRecentReportsToShow: 0, // Unlimited
        prioritizePinnedReports: true,
    });
}

/**
 * Build the options for the New Chat view
 *
 * @param {Object} reports
 * @param {Object} personalDetails
 * @param {String} searchValue
 * @returns {Object}
 */
function getNewChatOptions(reports, personalDetails, searchValue = '') {
    return getOptions(reports, personalDetails, {}, {
        searchValue,
        includePersonalDetails: true,
    });
}

/**
 * Build the options for the New Group view
 *
 * @param {Object} reports
 * @param {Object} personalDetails
 * @param {String} searchValue
 * @param {Array} selectedOptions
 * @returns {Object}
 */
function getNewGroupOptions(reports, personalDetails, searchValue = '', selectedOptions = []) {
    return getOptions(reports, personalDetails, {}, {
        searchValue,
        selectedOptions,
        includeRecentReports: true,
        includePersonalDetails: true,
        includeMultipleParticipantReports: false,
        maxRecentReportsToShow: 5,
    });
}

/**
 * Build the options for the Sidebar a.k.a. LHN
 *
 * @param {Object} reports
 * @param {Object} reportActions
 * @returns {Object}
 */
function getSidebarOptions(reports, reportActions) {
    return getOptions(reports, {}, reportActions, {
        includeRecentReports: true,
        includeMultipleParticipantReports: true,
        maxRecentReportsToShow: 0, // Unlimited
        prioritizePinnedReports: true,
    });
}

export {
    getSearchOptions,
    getNewChatOptions,
    getNewGroupOptions,
    getSidebarOptions,
};
