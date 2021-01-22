/* eslint-disable no-continue */
import _ from 'underscore';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash.get';
import lodashOrderBy from 'lodash.orderby';
import Str from 'expensify-common/lib/str';
import {getDefaultAvatar} from './actions/PersonalDetails';
import ONYXKEYS from '../ONYXKEYS';

/**
 * OptionsListUtils is used to build a list options passed to the OptionsList component. Several different UI views can
 * be configured to display different results based on the options passed to the private getOptions() method. Public
 * methods should be named for the views they build options for and then exported for use in a component.
 */

let currentUserLogin;

/**
 * Returns the personal details for an array of logins
 *
 * @param {Array} logins
 * @param {Object} personalDetails
 * @returns {Array}
 */
function getPersonalDetailsForLogins(logins, personalDetails) {
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
 * @param {Object} draftComments
 * @param {Number} activeReportID
 * @returns {Object}
 */
function createOption(personalDetailList, report, draftComments, activeReportID) {
    const hasMultipleParticipants = personalDetailList.length > 1;
    const personalDetail = personalDetailList[0];
    const hasDraftComment = report
        && (report.reportID !== activeReportID)
        && lodashGet(draftComments, `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${report.reportID}`, '').length > 0;

    return {
        text: report ? report.reportName : personalDetail.displayName,
        alternateText: (report && hasMultipleParticipants) ? report.reportName : personalDetail.login,
        icons: report ? report.icons : [personalDetail.avatarURL],

        // It doesn't make sense to provide a login in the case of a report with multiple participants since
        // there isn't any one single login to refer to for a report.
        login: !hasMultipleParticipants ? personalDetail.login : null,
        reportID: report ? report.reportID : null,
        isUnread: report ? report.unreadActionCount > 0 : null,
        hasDraftComment,
        keyForList: report ? String(report.reportID) : personalDetail.login,
        searchText: getSearchText(report, personalDetailList),
        isPinned: lodashGet(report, 'isPinned', false),
    };
}

Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: val => currentUserLogin = val && val.email,
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
 * @param {Object} reports
 * @param {Object} personalDetails
 * @param {Obejct} draftComments
 * @param {Number} activeReportID
 * @param {Object} options
 * @returns {Object}
 * @private
 */
function getOptions(reports, personalDetails, draftComments, activeReportID, {
    selectedOptions = [],
    maxRecentReportsToShow = 0,
    includeMultipleParticipantReports = false,
    includePersonalDetails = false,
    includeRecentReports = false,
    prioritizePinnedReports = false,
    sortByLastMessageTimestamp = false,
    searchValue = '',
}) {
    let recentReportOptions = [];
    const pinnedReportOptions = [];
    const personalDetailsOptions = [];

    const reportMapForLogins = {};
    const orderedReports = lodashOrderBy(reports, [
        sortByLastMessageTimestamp
            ? 'lastMessageTimestamp'
            : 'lastVisitedTimestamp',
    ], ['desc']);

    const allReportOptions = [];
    _.each(orderedReports, (report) => {
        const logins = lodashGet(report, ['participants'], []);

        // Report data can sometimes be incomplete. If we have no logins or reportID then we will skip this entry.
        if (!report.reportID || _.isEmpty(logins)) {
            return;
        }

        const reportPersonalDetails = getPersonalDetailsForLogins(logins, personalDetails);

        // Save the report in the map if this is a single participant so we can associate the reportID with the
        // personal detail option later.
        if (logins.length <= 1) {
            reportMapForLogins[logins[0]] = report;
        }
        allReportOptions.push(createOption(reportPersonalDetails, report, draftComments, activeReportID));
    });

    const allPersonalDetailsOptions = _.map(personalDetails, personalDetail => (
        createOption([personalDetail], reportMapForLogins[personalDetail.login], draftComments, activeReportID)
    ));

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
 * @param {Object} reports
 * @param {Object} personalDetails
 * @param {String} searchValue
 * @returns {Object}
 */
function getSearchOptions(
    reports,
    personalDetails,
    searchValue = '',
) {
    return getOptions(reports, personalDetails, {}, 0, {
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
function getNewChatOptions(
    reports,
    personalDetails,
    searchValue = '',
) {
    return getOptions(reports, personalDetails, {}, 0, {
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
function getNewGroupOptions(
    reports,
    personalDetails,
    searchValue = '',
    selectedOptions = [],
) {
    return getOptions(reports, personalDetails, {}, 0, {
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
 * @param {Object} reports
 * @param {Object} personalDetails
 * @param {Obejct} draftComments
 * @param {Number} activeReportID
 * @returns {Object}
 */
function getSidebarOptions(reports, personalDetails, draftComments, activeReportID) {
    return getOptions(reports, personalDetails, draftComments, activeReportID, {
        includeRecentReports: true,
        includeMultipleParticipantReports: true,
        maxRecentReportsToShow: 0, // Unlimited
        prioritizePinnedReports: true,
        sortByLastMessageTimestamp: true,
    });
}

export {
    getSearchOptions,
    getNewChatOptions,
    getNewGroupOptions,
    getSidebarOptions,
};
