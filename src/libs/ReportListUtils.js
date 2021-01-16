/* eslint-disable no-continue */
import _ from 'underscore';
import Onyx from 'react-native-onyx';
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

// In order to build our options we need references to all reports,
// personalDetails, draftComments, and the activeReportID.
const reports = {};
let personalDetails = {};
const draftComments = {};
let activeReportID;
let currentUserLogin;

// Each time we re-calculate the possible options we will create arrays options for reports and personalDetails.
let allReportOptions;
let allPersonalDetailsOptions;

/**
 * Check if the report has a draft comment
 *
 * @param {Number} reportID
 * @returns {Boolean}
 */
function hasComment(reportID) {
    const allComments = lodashGet(draftComments, `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`, '');
    return allComments.length > 0;
}

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
 * Returns the personal details for an array of logins
 *
 * @param {Array} logins
 * @returns {Array}
 */
function getPersonalDetailsForLogins(logins) {
    return _.map(logins, (login) => {
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
}

/**
 * Returns a string with all relevant search terms
 *
 * @param {Object} report
 * @param {Array} personalDetailList
 * @return {String}
 */
function getSearchText(report, personalDetailList) {
    const searchTerms = [];

    _.each(personalDetailList, (personalDetail) => {
        searchTerms.push(personalDetail.displayName);
        searchTerms.push(personalDetail.login);
    });

    if (report) {
        searchTerms.push(...report.reportName.split(',').map(name => name.trim()));
        searchTerms.push(...report.participants);
    }

    return _.unique(searchTerms).join(' ');
}

/**
 * Creates a report list option
 *
 * @param {Array<Object>} personalDetailList
 * @param {Object} [report]
 * @returns {Object}
 */
function createOption(personalDetailList, report) {
    const hasMultipleParticipants = personalDetailList.length > 1;
    const personalDetail = personalDetailList[0];
    return {
        text: report ? report.reportName : personalDetail.displayName,
        alternateText: (!report || !hasMultipleParticipants) ? personalDetail.login : report.reportName,
        icons: report ? report.icons : [personalDetail.avatarURL],

        // It doesn't make sense to provide a login in the case of a report with multiple participants since
        // there isn't any one single login to refer to for a report.
        login: !hasMultipleParticipants ? personalDetail.login : null,
        reportID: report ? report.reportID : null,
        isUnread: report ? report.unreadActionCount > 0 : null,
        hasDraftComment: report && report.reportID !== activeReportID && hasComment(report.reportID),
        keyForList: report ? String(report.reportID) : personalDetail.login,
        searchText: getSearchText(report, personalDetailList),
        isPinned: report && report.isPinned,
    };
}

/**
 * Rebuild the options. We are throttling this so the options are only rebuilt at most
 * once per second. It can be expensive to rebuild options so we slow this down a bit.
 */
const rebuildOptions = _.throttle(() => {
    const reportMapForLogins = {};
    const orderedReports = lodashOrderBy(reports, ['lastVisitedTimestamp'], ['desc']);
    allReportOptions = _.map(orderedReports, (report) => {
        const logins = getParticipantLogins(report);
        const hasMultipleParticipants = logins.length > 1;
        const reportPersonalDetails = getPersonalDetailsForLogins(logins);
        if (!hasMultipleParticipants) {
            reportMapForLogins[logins[0]] = report;
        }
        return createOption(reportPersonalDetails, report);
    });
    allPersonalDetailsOptions = _.map(personalDetails, personalDetail => (
        createOption([personalDetail], reportMapForLogins[personalDetail.login])
    ));
}, 1000, {leading: false});

Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: val => currentUserLogin = val && val.email,
});

Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: (report) => {
        const reportID = report.reportID;

        if (!reportID) {
            return;
        }

        const existingReport = reports[reportID];
        if (!existingReport) {
            reports[reportID] = report;
        } else {
            reports[report.reportID] = {...existingReport, ...report};
        }
        rebuildOptions();
    },
});

Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS,
    callback: (val) => {
        personalDetails = val;
        rebuildOptions();
    },
});

Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT,
    callback: (val, key) => {
        draftComments[key] = val;
    },
});

Onyx.connect({
    key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
    callback: val => activeReportID = val,
});

/**
 * Searches for a match when provided with a value
 *
 * @param {String} searchValue
 * @param {String} searchText
 * @returns {Boolean}
 */
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
 * @param {Object} reportActions
 * @param {Object} options
 * @returns {Object}
 * @private
 */
function getOptions({
    selectedOptions = [],
    maxRecentReportsToShow = 0,
    includeMultipleParticipantReports = false,
    includePersonalDetails = false,
    includeRecentReports = false,
    prioritizePinnedReports = false,
    searchValue = '',
}) {
    let recentReportOptions = [];
    const pinnedReportOptions = [];
    const personalDetailsOptions = [];

    // Always exclude already selected options and the currently logged in user
    const loginOptionsToExclude = [...selectedOptions, {login: currentUserLogin}];

    if (includeRecentReports) {
        for (let i = 0; i < allReportOptions.length; i++) {
            // Stop adding options to the recentReports array when we reach the maxRecentReportsToShow value
            if (recentReportOptions.length > 0 && recentReportOptions.length === maxRecentReportsToShow) {
                break;
            }

            const reportOption = allReportOptions[i];

            // Skip if we aren't including multiple participant reports and this report has multiple participants
            if (!includeMultipleParticipantReports && !reportOption.login) {
                continue;
            }

            // Check the report to see if it has a single participant and if the participant is already selected
            if (reportOption.login && _.some(loginOptionsToExclude, option => option.login === reportOption.login)) {
                continue;
            }

            // Finally check to see if this options is a match for the provided search string if we have one
            if (searchValue && !isSearchStringMatch(searchValue, reportOption.searchText)) {
                continue;
            }

            // If the report is pinned and we are using the option to display pinned reports on top then we need to
            // collect the pinned reports so we can sort them alphabetically once they are collected
            if (prioritizePinnedReports && reportOption.isPinned) {
                pinnedReportOptions.push(reportOption);
            } else {
                recentReportOptions.push(reportOption);
            }

            // Add this login to the exclude list so it won't appear when we process the personal details
            if (reportOption.login) {
                loginOptionsToExclude.push({login: reportOption.login});
            }
        }
    }

    // If we are prioritizing our pinned reports then shift them to the front and sort them by report name
    if (prioritizePinnedReports) {
        const sortedPinnedReports = lodashOrderBy(pinnedReportOptions, ['text'], ['asc']);
        recentReportOptions = sortedPinnedReports.concat(recentReportOptions);
    }

    if (includePersonalDetails) {
        // Next loop over all personal details removing any that are selectedUsers or recentChats
        _.each(allPersonalDetailsOptions, (personalDetailOption) => {
            if (_.some(loginOptionsToExclude, loginOptionToExclude => (
                loginOptionToExclude.login === personalDetailOption.login
            ))) {
                return;
            }

            if (searchValue && !isSearchStringMatch(searchValue, personalDetailOption.searchText)) {
                return;
            }

            personalDetailsOptions.push(personalDetailOption);
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
 * @param {String} searchValue
 * @returns {Object}
 */
function getSearchOptions(searchValue = '') {
    return getOptions({
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
 * @param {String} searchValue
 * @returns {Object}
 */
function getNewChatOptions(searchValue = '') {
    return getOptions({
        searchValue,
        includePersonalDetails: true,
    });
}

/**
 * Build the options for the New Group view
 *
 * @param {String} searchValue
 * @param {Array} selectedOptions
 * @returns {Object}
 */
function getNewGroupOptions(searchValue = '', selectedOptions = []) {
    return getOptions({
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
 * @returns {Object}
 */
function getSidebarOptions() {
    return getOptions({
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
