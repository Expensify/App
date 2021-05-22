/* eslint-disable no-continue */
import _ from 'underscore';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import lodashOrderBy from 'lodash/orderBy';
import Str from 'expensify-common/lib/str';
import {getDefaultAvatar} from './actions/PersonalDetails';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import {getReportParticipantsTitle} from './reportUtils';
import {translate} from './translate';
import Permissions from './Permissions';

/**
 * OptionsListUtils is used to build a list options passed to the OptionsList component. Several different UI views can
 * be configured to display different results based on the options passed to the private getOptions() method. Public
 * methods should be named for the views they build options for and then exported for use in a component.
 */

let currentUserLogin;
let countryCodeByIP;
let preferredLocale;

// We are initializing a default avatar here so that we use the same default color for each user we are inviting. This
// will update when the OptionsListUtils re-loads. But will stay the same color for the life of the JS session.
const defaultAvatarForUserToInvite = getDefaultAvatar();

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
                avatar: getDefaultAvatar(login),
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
 * @param {Boolean} showChatPreviewLine
 * @returns {Object}
 */
function createOption(personalDetailList, report, draftComments, {showChatPreviewLine = false}) {
    const hasMultipleParticipants = personalDetailList.length > 1;
    const personalDetail = personalDetailList[0];
    const hasDraftComment = report
        && draftComments
        && lodashGet(draftComments, `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${report.reportID}`, '').length > 0;

    const hasOutstandingIOU = lodashGet(report, 'hasOutstandingIOU', false);
    const lastActorDetails = report ? _.find(personalDetailList, {login: report.lastActorEmail}) : null;
    const lastMessageText = report
        ? (hasMultipleParticipants && lastActorDetails
            ? `${lastActorDetails.displayName}: `
            : '')
        + _.unescape(report.lastMessageText)
        : '';
    const tooltipText = getReportParticipantsTitle(lodashGet(report, ['participants'], []));
    const fullTitle = personalDetailList.map(({firstName, login}) => firstName || login).join(', ');
    return {
        text: hasMultipleParticipants ? fullTitle : report?.reportName || personalDetail.displayName,
        alternateText: (showChatPreviewLine && lastMessageText)
            ? lastMessageText
            : Str.removeSMSDomain(personalDetail.login),
        icons: report ? report.icons : [personalDetail.avatar],
        tooltipText,
        participantsList: personalDetailList,

        // It doesn't make sense to provide a login in the case of a report with multiple participants since
        // there isn't any one single login to refer to for a report.
        login: !hasMultipleParticipants ? personalDetail.login : null,
        reportID: report ? report.reportID : null,
        isUnread: report ? report.unreadActionCount > 0 : null,
        hasDraftComment,
        keyForList: report ? String(report.reportID) : personalDetail.login,
        searchText: getSearchText(report, personalDetailList),
        isPinned: lodashGet(report, 'isPinned', false),
        hasOutstandingIOU,
        iouReportID: lodashGet(report, 'iouReportID'),
    };
}

Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: val => currentUserLogin = val && val.email,
});

Onyx.connect({
    key: ONYXKEYS.COUNTRY_CODE,
    callback: val => countryCodeByIP = val || 1,
});

Onyx.connect({
    key: ONYXKEYS.PREFERRED_LOCALE,
    callback: val => preferredLocale = val || 'en',
});

/**
 * Searches for a match when provided with a value
 *
 * @param {String} searchValue
 * @param {String} searchText
 * @returns {Boolean}
 */
function isSearchStringMatch(searchValue, searchText) {
    const searchWords = searchValue.split(' ');
    return _.every(searchWords, (word) => {
        const matchRegex = new RegExp(Str.escapeForRegExp(word), 'i');
        const valueToSearch = searchText && searchText.replace(new RegExp(/&nbsp;/g), '');
        return matchRegex.test(valueToSearch);
    });
}

/**
 * Build the options
 *
 * @param {Object} reports
 * @param {Object} personalDetails
 * @param {Object} draftComments
 * @param {Number} activeReportID
 * @param {Object} options
 * @returns {Object}
 * @private
 */
function getOptions(reports, personalDetails, draftComments, activeReportID, {
    selectedOptions = [],
    maxRecentReportsToShow = 0,
    excludeConcierge = false,
    includeMultipleParticipantReports = false,
    includePersonalDetails = false,
    includeRecentReports = false,
    prioritizePinnedReports = false,
    sortByLastMessageTimestamp = false,
    searchValue = '',
    showChatPreviewLine = false,
    showReportsWithNoComments = false,
    hideReadReports = false,
    sortByAlphaAsc = false,
}) {
    let recentReportOptions = [];
    const pinnedReportOptions = [];
    const personalDetailsOptions = [];

    const reportMapForLogins = {};
    let sortProperty = sortByLastMessageTimestamp
        ? ['lastMessageTimestamp']
        : ['lastVisitedTimestamp'];
    if (sortByAlphaAsc) {
        sortProperty = ['reportName'];
    }
    const sortDirection = [sortByAlphaAsc ? 'asc' : 'desc'];
    const orderedReports = lodashOrderBy(reports, sortProperty, sortDirection);

    const allReportOptions = [];
    _.each(orderedReports, (report) => {
        const logins = lodashGet(report, ['participants'], []);

        // Report data can sometimes be incomplete. If we have no logins or reportID then we will skip this entry.
        if (!report || !report.reportID || _.isEmpty(logins)) {
            return;
        }

        const shouldFilterReportIfEmpty = !showReportsWithNoComments && report.lastMessageTimestamp === 0;
        const shouldFilterReportIfRead = hideReadReports && report.unreadActionCount === 0;
        const shouldFilterReport = shouldFilterReportIfEmpty || shouldFilterReportIfRead;
        if (report.reportID !== activeReportID && !report.isPinned && shouldFilterReport) {
            return;
        }
        const reportPersonalDetails = getPersonalDetailsForLogins(logins, personalDetails);

        // Save the report in the map if this is a single participant so we can associate the reportID with the
        // personal detail option later.
        if (logins.length <= 1) {
            reportMapForLogins[logins[0]] = report;
        }
        allReportOptions.push(createOption(reportPersonalDetails, report, draftComments, {
            showChatPreviewLine,
        }));
    });

    const allPersonalDetailsOptions = _.map(personalDetails, personalDetail => (
        createOption([personalDetail], reportMapForLogins[personalDetail.login], draftComments, {
            showChatPreviewLine,
        })
    ));

    // Always exclude already selected options and the currently logged in user
    const loginOptionsToExclude = [...selectedOptions, {login: currentUserLogin}];

    if (excludeConcierge) {
        loginOptionsToExclude.push({login: CONST.EMAIL.CONCIERGE});
    }

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

    let userToInvite = null;
    if (searchValue
            && recentReportOptions.length === 0
            && personalDetailsOptions.length === 0
            && _.every(selectedOptions, option => option.login !== searchValue)
            && ((Str.isValidEmail(searchValue) && !Str.isDomainEmail(searchValue)) || Str.isValidPhone(searchValue))
            && (searchValue !== CONST.EMAIL.CHRONOS || Permissions.canUseChronos())
    ) {
        // If the phone number doesn't have an international code then let's prefix it with the
        // current users international code based on their IP address.
        const login = (Str.isValidPhone(searchValue) && !searchValue.includes('+'))
            ? `+${countryCodeByIP}${searchValue}`
            : searchValue;
        const userInvitePersonalDetails = getPersonalDetailsForLogins([login], personalDetails);
        userToInvite = createOption(userInvitePersonalDetails, null, draftComments, {
            showChatPreviewLine,
        });
        userToInvite.icons = [defaultAvatarForUserToInvite];
    }

    return {
        personalDetails: personalDetailsOptions,
        recentReports: recentReportOptions,
        userToInvite,
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
        prioritizePinnedReports: false,
        showChatPreviewLine: true,
        showReportsWithNoComments: true,
        includePersonalDetails: true,
        sortByLastMessageTimestamp: false,
    });
}

/**
 * Build the options for the New Chat view
 *
 * @param {Object} reports
 * @param {Object} personalDetails
 * @param {String} searchValue
 * @param {Boolean} excludeConcierge
 * @returns {Object}
 */
function getNewChatOptions(
    reports,
    personalDetails,
    searchValue = '',
    excludeConcierge,
) {
    return getOptions(reports, personalDetails, {}, 0, {
        searchValue,
        includePersonalDetails: true,
        excludeConcierge,
    });
}

/**
 * Build the IOUConfirmation options for showing MyPersonalDetail
 *
 * @param {Object} myPersonalDetail
 * @param {String} amountText
 * @returns {Object}
 */
function getIOUConfirmationOptionsFromMyPersonalDetail(myPersonalDetail, amountText) {
    return {
        text: myPersonalDetail.displayName,
        alternateText: myPersonalDetail.login,
        icons: [myPersonalDetail.avatar],
        descriptiveText: amountText,
    };
}

/**
 * Build the IOUConfirmationOptions for showing participants
 *
 * @param {Array} participants
 * @param {String} amountText
 * @returns {Array}
 */
function getIOUConfirmationOptionsFromParticipants(
    participants, amountText,
) {
    return participants.map(participant => ({
        ...participant, descriptiveText: amountText,
    }));
}

/**
 * Build the options for the New Group view
 *
 * @param {Object} reports
 * @param {Object} personalDetails
 * @param {String} searchValue
 * @param {Array} selectedOptions
 * @param {Boolean} excludeConcierge
 * @returns {Object}
 */
function getNewGroupOptions(
    reports,
    personalDetails,
    searchValue = '',
    selectedOptions = [],
    excludeConcierge,
) {
    return getOptions(reports, personalDetails, {}, 0, {
        searchValue,
        selectedOptions,
        includeRecentReports: true,
        includePersonalDetails: true,
        includeMultipleParticipantReports: false,
        maxRecentReportsToShow: 5,
        excludeConcierge,
    });
}

/**
 * Build the options for the Sidebar a.k.a. LHN
 * @param {Object} reports
 * @param {Object} personalDetails
 * @param {Object} draftComments
 * @param {Number} activeReportID
 * @param {String} priorityMode
 * @returns {Object}
 */
function getSidebarOptions(reports, personalDetails, draftComments, activeReportID, priorityMode) {
    let sideBarOptions = {
        prioritizePinnedReports: true,
    };
    if (priorityMode === CONST.PRIORITY_MODE.GSD) {
        sideBarOptions = {
            hideReadReports: true,
            sortByAlphaAsc: true,
        };
    }

    return getOptions(reports, personalDetails, draftComments, activeReportID, {
        includeRecentReports: true,
        includeMultipleParticipantReports: true,
        maxRecentReportsToShow: 0, // Unlimited
        sortByLastMessageTimestamp: true,
        showChatPreviewLine: true,
        ...sideBarOptions,
    });
}

/**
 * Helper method that returns the text to be used for the header's message and title (if any)
 *
 * @param {Boolean} hasSelectableOptions
 * @param {Boolean} hasUserToInvite
 * @param {String} searchValue
 * @param {Boolean} [maxParticipantsReached]
 * @return {String}
 */
function getHeaderMessage(hasSelectableOptions, hasUserToInvite, searchValue, maxParticipantsReached = false) {
    if (maxParticipantsReached) {
        return translate(preferredLocale, 'messages.maxParticipantsReached');
    }

    if (!hasSelectableOptions && !hasUserToInvite) {
        if (/^\d+$/.test(searchValue)) {
            return translate(preferredLocale, 'messages.noPhoneNumber');
        }

        return searchValue;
    }

    return '';
}

/**
 * Returns the currency list for sections display
 *
 * @param {Object} currencyOptions
 * @param {String} searchValue
 * @param {Object} selectedCurrency
 * @returns {Array}
 */
function getCurrencyListForSections(currencyOptions, searchValue) {
    const filteredOptions = currencyOptions.filter(currencyOption => (
        isSearchStringMatch(searchValue, currencyOption.searchText)));

    return {
        // returns filtered options i.e. options with string match if search text is entered
        currencyOptions: filteredOptions,
    };
}

export {
    getSearchOptions,
    getNewChatOptions,
    getNewGroupOptions,
    getSidebarOptions,
    getHeaderMessage,
    getPersonalDetailsForLogins,
    getCurrencyListForSections,
    getIOUConfirmationOptionsFromMyPersonalDetail,
    getIOUConfirmationOptionsFromParticipants,
};
