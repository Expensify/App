/* eslint-disable no-continue */
import _ from 'underscore';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import lodashOrderBy from 'lodash/orderBy';
import Str from 'expensify-common/lib/str';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import {
    getReportParticipantsTitle, isDefaultRoom, getDefaultRoomSubtitle, isArchivedRoom,
} from './reportUtils';
import {translate} from './translate';
import Permissions from './Permissions';
import md5 from './md5';

/**
 * OptionsListUtils is used to build a list options passed to the OptionsList component. Several different UI views can
 * be configured to display different results based on the options passed to the private getOptions() method. Public
 * methods should be named for the views they build options for and then exported for use in a component.
 */

let currentUserLogin;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: val => currentUserLogin = val && val.email,
});

let currentUser;
Onyx.connect({
    key: ONYXKEYS.USER,
    callback: val => currentUser = val,
});

let countryCodeByIP;
Onyx.connect({
    key: ONYXKEYS.COUNTRY_CODE,
    callback: val => countryCodeByIP = val || 1,
});

let preferredLocale;
Onyx.connect({
    key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    callback: val => preferredLocale = val || CONST.DEFAULT_LOCALE,
});

const policies = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    callback: (policy, key) => {
        if (policy && key && policy.name) {
            policies[key] = policy;
        }
    },
});

const iouReports = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_IOUS,
    callback: (iouReport, key) => {
        if (iouReport && key && iouReport.ownerEmail) {
            iouReports[key] = iouReport;
        }
    },
});

/**
 * Helper method to return a default avatar
 *
 * @param {String} [login]
 * @returns {String}
 */
function getDefaultAvatar(login = '') {
    // There are 8 possible default avatars, so we choose which one this user has based
    // on a simple hash of their login (which is converted from HEX to INT)
    const loginHashBucket = (parseInt(md5(login).substring(0, 4), 16) % 8) + 1;
    return `${CONST.CLOUDFRONT_URL}/images/avatars/avatar_${loginHashBucket}.png`;
}

// We are initializing a default avatar here so that we use the same default color for each user we are inviting. This
// will update when the OptionsListUtils re-loads. But will stay the same color for the life of the JS session.
const defaultAvatarForUserToInvite = getDefaultAvatar();

/**
 * Adds expensify SMS domain (@expensify.sms) if login is a phone number and if it's not included yet
 *
 * @param {String} login
 * @return {String}
 */
function addSMSDomainIfPhoneNumber(login) {
    if (Str.isValidPhone(login) && !Str.isValidEmail(login)) {
        return login + CONST.SMS.DOMAIN;
    }
    return login;
}

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
                login: addSMSDomainIfPhoneNumber(login),
                displayName: login,
                avatar: getDefaultAvatar(login),
            };
        }

        return personalDetail;
    });
}

/**
 * Constructs a Set with all possible names (displayName, firstName, lastName, email) for all participants in a report,
 * to be used in isSearchStringMatch.
 *
 * @param {Array<Object>} personalDetailList
 * @return {Set<String>}
 */
function getParticipantNames(personalDetailList) {
    // We use a Set because `Set.has(value)` on a Set of with n entries is up to n (or log(n)) times faster than
    // `_.contains(Array, value)` for an Array with n members.
    const participantNames = new Set();
    _.each(personalDetailList, (participant) => {
        if (participant.login) {
            participantNames.add(participant.login.toLowerCase());
        }
        if (participant.firstName) {
            participantNames.add(participant.firstName.toLowerCase());
        }
        if (participant.lastName) {
            participantNames.add(participant.lastName.toLowerCase());
        }
        if (participant.displayName) {
            participantNames.add(participant.displayName.toLowerCase());
        }
    });
    return participantNames;
}

/**
 * Returns a string with all relevant search terms.
 * Default should be serachable by policy/domain name but not by participants.
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
        searchTerms.push(...report.reportName.split(',').map(name => name.trim()));

        if (isDefaultChatRoom) {
            const defaultRoomSubtitle = getDefaultRoomSubtitle(report, policies);
            searchTerms.push(...defaultRoomSubtitle);
            searchTerms.push(...defaultRoomSubtitle.split(',').map(name => name.trim()));
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
 * @param {Object} draftComments
 * @param {Boolean} showChatPreviewLine
 * @param {Boolean} forcePolicyNamePreview
 * @returns {Object}
 */
function createOption(personalDetailList, report, draftComments, {
    showChatPreviewLine = false, forcePolicyNamePreview = false,
}) {
    const isDefaultChatRoom = isDefaultRoom(report);
    const hasMultipleParticipants = personalDetailList.length > 1 || isDefaultChatRoom;
    const personalDetail = personalDetailList[0];
    const reportDraftComment = report
        && draftComments
        && lodashGet(draftComments, `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${report.reportID}`, '');

    const hasOutstandingIOU = lodashGet(report, 'hasOutstandingIOU', false);
    const iouReport = hasOutstandingIOU
        ? lodashGet(iouReports, `${ONYXKEYS.COLLECTION.REPORT_IOUS}${report.iouReportID}`, {})
        : {};

    const lastActorDetails = report ? _.find(personalDetailList, {login: report.lastActorEmail}) : null;
    const lastMessageText = report
        ? (hasMultipleParticipants && lastActorDetails
            ? `${lastActorDetails.displayName}: `
            : '')
        + _.unescape(report.lastMessageText)
        : '';

    const tooltipText = getReportParticipantsTitle(lodashGet(report, ['participants'], []));

    let text;
    let alternateText;
    if (isDefaultChatRoom) {
        text = lodashGet(report, ['reportName'], '');
        alternateText = (showChatPreviewLine && !forcePolicyNamePreview && lastMessageText)
            ? lastMessageText
            : getDefaultRoomSubtitle(report, policies);
    } else {
        text = hasMultipleParticipants
            ? personalDetailList
                .map(({firstName, login}) => firstName || Str.removeSMSDomain(login))
                .join(', ')
            : lodashGet(report, ['reportName'], personalDetail.displayName);
        alternateText = (showChatPreviewLine && lastMessageText)
            ? lastMessageText
            : Str.removeSMSDomain(personalDetail.login);
    }
    return {
        text,
        alternateText,
        icons: report ? report.icons : [personalDetail.avatar],
        tooltipText,
        participantsList: personalDetailList,

        // It doesn't make sense to provide a login in the case of a report with multiple participants since
        // there isn't any one single login to refer to for a report.
        // If single login is a mobile number, appending SMS domain
        login: !hasMultipleParticipants ? addSMSDomainIfPhoneNumber(personalDetail.login) : null,
        reportID: report ? report.reportID : null,
        isUnread: report ? report.unreadActionCount > 0 : null,
        hasDraftComment: _.size(reportDraftComment) > 0,
        keyForList: report ? String(report.reportID) : personalDetail.login,
        searchText: getSearchText(report, personalDetailList, isDefaultChatRoom),
        isPinned: lodashGet(report, 'isPinned', false),
        hasOutstandingIOU,
        iouReportID: lodashGet(report, 'iouReportID'),
        isIOUReportOwner: lodashGet(iouReport, 'ownerEmail', '') === currentUserLogin,
        iouReportAmount: lodashGet(iouReport, 'total', 0),
        isDefaultChatRoom,
        isArchivedRoom: isArchivedRoom(report),
    };
}

/**
 * Searches for a match when provided with a value
 *
 * @param {String} searchValue
 * @param {String} searchText
 * @param {Set<String>} [participantNames]
 * @param {Boolean} isDefaultChatRoom
 * @returns {Boolean}
 */
function isSearchStringMatch(searchValue, searchText, participantNames = new Set(), isDefaultChatRoom = false) {
    const searchWords = searchValue
        .replace(/,/g, ' ')
        .split(' ')
        .map(word => word.trim());
    return _.every(searchWords, (word) => {
        const matchRegex = new RegExp(Str.escapeForRegExp(word), 'i');
        const valueToSearch = searchText && searchText.replace(new RegExp(/&nbsp;/g), '');
        return matchRegex.test(valueToSearch) || (!isDefaultChatRoom && participantNames.has(word));
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
    betas = [],
    selectedOptions = [],
    maxRecentReportsToShow = 0,
    excludeConcierge = false,
    excludeDefaultRooms = false,
    includeMultipleParticipantReports = false,
    includePersonalDetails = false,
    includeRecentReports = false,
    prioritizePinnedReports = false,
    prioritizeDefaultRoomsInSearch = false,
    sortByLastMessageTimestamp = false,
    searchValue = '',
    showChatPreviewLine = false,
    showReportsWithNoComments = false,
    showReportsWithDrafts = false,
    hideReadReports = false,
    sortByAlphaAsc = false,
    forcePolicyNamePreview = false,
    prioritizeIOUDebts = false,
}) {
    let recentReportOptions = [];
    const pinnedReportOptions = [];
    const personalDetailsOptions = [];
    const iouDebtReportOptions = [];

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

        const reportDraftComment = report
            && draftComments
            && lodashGet(draftComments, `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${report.reportID}`, '');
        const iouReportOwner = lodashGet(report, 'hasOutstandingIOU', false)
            ? lodashGet(iouReports, [`${ONYXKEYS.COLLECTION.REPORT_IOUS}${report.iouReportID}`, 'ownerEmail'], '')
            : '';

        const reportContainsIOUDebt = iouReportOwner && iouReportOwner !== currentUserLogin;
        const shouldFilterReportIfEmpty = !showReportsWithNoComments && report.lastMessageTimestamp === 0;
        const shouldFilterReportIfRead = hideReadReports && report.unreadActionCount === 0;
        const shouldShowReportIfHasDraft = showReportsWithDrafts && reportDraftComment && reportDraftComment.length > 0;
        const shouldFilterReport = shouldFilterReportIfEmpty || shouldFilterReportIfRead;
        if (report.reportID !== activeReportID
            && !report.isPinned
            && !shouldShowReportIfHasDraft
            && shouldFilterReport
            && !reportContainsIOUDebt) {
            return;
        }

        if (isDefaultRoom(report) && (!Permissions.canUseDefaultRooms(betas) || excludeDefaultRooms)) {
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
            forcePolicyNamePreview,
        }));
    });

    const allPersonalDetailsOptions = _.map(personalDetails, personalDetail => (
        createOption([personalDetail], reportMapForLogins[personalDetail.login], draftComments, {
            showChatPreviewLine,
            forcePolicyNamePreview,
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

            // Finally check to see if this option is a match for the provided search string if we have one
            const {searchText, participantsList, isDefaultChatRoom} = reportOption;
            const participantNames = getParticipantNames(participantsList);
            if (searchValue && !isSearchStringMatch(searchValue, searchText, participantNames, isDefaultChatRoom)) {
                continue;
            }

            // If the report is pinned and we are using the option to display pinned reports on top then we need to
            // collect the pinned reports so we can sort them alphabetically once they are collected
            if (prioritizePinnedReports && reportOption.isPinned) {
                pinnedReportOptions.push(reportOption);
            } else if (prioritizeIOUDebts && reportOption.hasOutstandingIOU && !reportOption.isIOUReportOwner) {
                iouDebtReportOptions.push(reportOption);
            } else {
                recentReportOptions.push(reportOption);
            }

            // Add this login to the exclude list so it won't appear when we process the personal details
            if (reportOption.login) {
                loginOptionsToExclude.push({login: reportOption.login});
            }
        }
    }

    // If we are prioritizing IOUs the user owes, add them before the normal recent report options
    if (prioritizeIOUDebts) {
        const sortedIOUReports = lodashOrderBy(iouDebtReportOptions, ['iouReportAmount'], ['desc']);
        recentReportOptions = sortedIOUReports.concat(recentReportOptions);
    }

    // If we are prioritizing our pinned reports then shift them to the front and sort them by report name
    if (prioritizePinnedReports) {
        const sortedPinnedReports = lodashOrderBy(pinnedReportOptions, ['text'], ['asc']);
        recentReportOptions = sortedPinnedReports.concat(recentReportOptions);
    }

    // If we are prioritizing default rooms in search, do it only once we started something
    if (prioritizeDefaultRoomsInSearch && searchValue !== '') {
        const reportsSplitByDefaultChatRoom = _.partition(recentReportOptions, option => option.isDefaultChatRoom);
        recentReportOptions = reportsSplitByDefaultChatRoom[0].concat(reportsSplitByDefaultChatRoom[1]);
    }

    if (includePersonalDetails) {
        // Next loop over all personal details removing any that are selectedUsers or recentChats
        _.each(allPersonalDetailsOptions, (personalDetailOption) => {
            if (_.some(loginOptionsToExclude, loginOptionToExclude => (
                loginOptionToExclude.login === personalDetailOption.login
            ))) {
                return;
            }
            const {searchText, participantsList, isDefaultChatRoom} = personalDetailOption;
            const participantNames = getParticipantNames(participantsList);
            if (searchValue && !isSearchStringMatch(searchValue, searchText, participantNames, isDefaultChatRoom)) {
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
        && (searchValue !== CONST.EMAIL.CHRONOS || Permissions.canUseChronos(betas))
    ) {
        // If the phone number doesn't have an international code then let's prefix it with the
        // current user's international code based on their IP address.
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
 * @param {Array<String>} betas
 * @returns {Object}
 */
function getSearchOptions(
    reports,
    personalDetails,
    searchValue = '',
    betas,
) {
    return getOptions(reports, personalDetails, {}, 0, {
        betas,
        searchValue,
        includeRecentReports: true,
        includeMultipleParticipantReports: true,
        maxRecentReportsToShow: 0, // Unlimited
        prioritizePinnedReports: false,
        prioritizeDefaultRoomsInSearch: true,
        showChatPreviewLine: true,
        showReportsWithNoComments: true,
        includePersonalDetails: true,
        sortByLastMessageTimestamp: false,
        forcePolicyNamePreview: true,
        prioritizeIOUDebts: false,
    });
}

/**
 * Build the options for the New Chat view
 *
 * @param {Object} reports
 * @param {Object} personalDetails
 * @param {String} searchValue
 * @param {Boolean} excludeConcierge
 * @param {Array<String>} betas
 * @returns {Object}
 */
function getNewChatOptions(
    reports,
    personalDetails,
    searchValue = '',
    excludeConcierge,
    betas,
) {
    return getOptions(reports, personalDetails, {}, 0, {
        betas,
        searchValue,
        excludeDefaultRooms: true,
        includePersonalDetails: true,
        includeRecentReports: true,
        maxRecentReportsToShow: 5,
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
        login: myPersonalDetail.login,
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
 * @param {Array<String>} betas
 * @returns {Object}
 */
function getNewGroupOptions(
    reports,
    personalDetails,
    searchValue = '',
    selectedOptions = [],
    excludeConcierge,
    betas,
) {
    return getOptions(reports, personalDetails, {}, 0, {
        betas,
        searchValue,
        selectedOptions,
        excludeDefaultRooms: true,
        includeRecentReports: true,
        includePersonalDetails: true,
        includeMultipleParticipantReports: false,
        maxRecentReportsToShow: 5,
        excludeConcierge,
    });
}

/**
 * Build the options for the Sidebar a.k.a. LHN
 *
 * @param {Object} reports
 * @param {Object} personalDetails
 * @param {Object} draftComments
 * @param {Number} activeReportID
 * @param {String} priorityMode
 * @param {Array<String>} betas
 * @returns {Object}
 */
function getSidebarOptions(
    reports,
    personalDetails,
    draftComments,
    activeReportID,
    priorityMode,
    betas,
) {
    let sideBarOptions = {
        prioritizePinnedReports: true,
        prioritizeIOUDebts: true,
    };
    if (priorityMode === CONST.PRIORITY_MODE.GSD) {
        sideBarOptions = {
            hideReadReports: true,
            sortByAlphaAsc: true,
            showReportsWithDrafts: true,
        };
    }

    return getOptions(reports, personalDetails, draftComments, activeReportID, {
        betas,
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

    if (searchValue && CONST.REGEX.DIGITS_AND_PLUS.test(searchValue) && !Str.isValidPhone(searchValue)) {
        return translate(preferredLocale, 'messages.noPhoneNumber');
    }

    if (!hasSelectableOptions && !hasUserToInvite) {
        if (/^\d+$/.test(searchValue)) {
            return translate(preferredLocale, 'messages.noPhoneNumber');
        }

        return translate(preferredLocale, 'common.noResultsFound');
    }

    return '';
}

/**
 * Returns the currency list for sections display
 *
 * @param {Object} currencyOptions
 * @param {String} searchValue
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

/**
 * Returns the appropriate icons for the given chat report using personalDetails if applicable
 *
 * @param {Object} report
 * @param {Object} personalDetails
 * @returns {String}
 */
function getReportIcons(report, personalDetails) {
    // Default rooms have a specific avatar so we can return any non-empty array
    if (isDefaultRoom(report)) {
        return [''];
    }
    return _.map(report.participants, dmParticipant => ({
        firstName: lodashGet(personalDetails, [dmParticipant, 'firstName'], ''),
        avatar: lodashGet(personalDetails, [dmParticipant, 'avatarThumbnail'], '')
            || getDefaultAvatar(dmParticipant),
    }))
        .sort((first, second) => first.firstName - second.firstName)
        .map(item => item.avatar);
}

/**
 * Returns the given userDetails is currentUser or not.
 * @param {Object} userDetails
 * @returns {Bool}
 */

function isCurrentUser(userDetails) {
    if (!userDetails) {
        // If userDetails is null or undefined
        return false;
    }

    // If user login is mobile number, append sms domain if not appended already just a fail safe.
    const userDetailsLogin = addSMSDomainIfPhoneNumber(userDetails.login);

    // Initial check with currentUserLogin
    let result = currentUserLogin.toLowerCase() === userDetailsLogin.toLowerCase();
    const {loginList} = currentUser;
    let index = 0;

    // Checking userDetailsLogin against to current user login options.
    while (index < loginList.length && !result) {
        if (loginList[index].partnerUserID.toLowerCase() === userDetailsLogin.toLowerCase()) {
            result = true;
        }
        index++;
    }
    return result;
}

export {
    addSMSDomainIfPhoneNumber,
    getSearchOptions,
    getNewChatOptions,
    getNewGroupOptions,
    getSidebarOptions,
    getHeaderMessage,
    getPersonalDetailsForLogins,
    getCurrencyListForSections,
    getIOUConfirmationOptionsFromMyPersonalDetail,
    getIOUConfirmationOptionsFromParticipants,
    getDefaultAvatar,
    getReportIcons,
    isCurrentUser,
};
