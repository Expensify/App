/* eslint-disable no-continue */
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import lodashOrderBy from 'lodash/orderBy';
import * as ReportUtils from '../reportUtils';
import Permissions from '../Permissions';
import ONYXKEYS from '../../ONYXKEYS';
import * as PersonalDetailsUtils from '../PersonalDetailsUtils';
import CONST from '../../CONST';
import * as store from './store';
import createOption from './createOption';
import isCurrentUser from './isCurrentUser';
import isSearchStringMatch from './isSearchStringMatch';

// We are initializing a default avatar here so that we use the same default color for each user we are inviting. This
// will update when the OptionsListUtils re-loads. But will stay the same color for the life of the JS session.
const defaultAvatarForUserToInvite = PersonalDetailsUtils.getDefaultAvatar();

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
 * @param {String} searchValue
 * @param {Object} option
 * @returns {Boolean}
 */
function doParticipantNamesMatchSearch(searchValue, option) {
    const {searchText, participantsList, isDefaultChatRoom} = option;
    const participantNames = getParticipantNames(participantsList);
    return isSearchStringMatch(searchValue, searchText, participantNames, isDefaultChatRoom);
}

/**
 * Build the options
 *
 * @param {Object} reports
 * @param {Object} personalDetails
 * @param {Number} activeReportID
 * @param {Object} options
 * @returns {Object}
 * @private
 */
function getOptions(reports, personalDetails, activeReportID, {
    betas = [],
    selectedOptions = [],
    maxRecentReportsToShow = 0,
    excludeLogins = [],
    excludeDefaultRooms = false,
    includeMultipleParticipantReports = false,
    includePersonalDetails = false,
    includeRecentReports = false,
    prioritizePinnedReports = false,
    prioritizeDefaultRoomsInSearch = false,
    sortByReportTypeInSearch = false,
    sortByLastMessageTimestamp = false,
    searchValue = '',
    showChatPreviewLine = false,
    showReportsWithNoComments = false,
    showReportsWithDrafts = false,
    hideReadReports = false,
    sortByAlphaAsc = false,
    forcePolicyNamePreview = false,
    prioritizeIOUDebts = false,
    prioritizeReportsWithDraftComments = false,
}) {
    let recentReportOptions = [];
    const pinnedReportOptions = [];
    const personalDetailsOptions = [];
    const iouDebtReportOptions = [];
    const draftReportOptions = [];

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

        const hasDraftComment = ReportUtils.hasReportDraftComment(report);
        const iouReportOwner = lodashGet(report, 'hasOutstandingIOU', false)
            ? lodashGet(store.getIOUReports(), [`${ONYXKEYS.COLLECTION.REPORT_IOUS}${report.iouReportID}`, 'ownerEmail'], '')
            : '';

        const reportContainsIOUDebt = iouReportOwner && iouReportOwner !== store.getCurrentUserLogin();
        const shouldFilterReportIfEmpty = !showReportsWithNoComments && report.lastMessageTimestamp === 0;
        const shouldFilterReportIfRead = hideReadReports && report.unreadActionCount === 0;
        const shouldShowReportIfHasDraft = showReportsWithDrafts && hasDraftComment;
        const shouldFilterReport = shouldFilterReportIfEmpty || shouldFilterReportIfRead;
        if (report.reportID !== activeReportID
            && !report.isPinned
            && !shouldShowReportIfHasDraft
            && shouldFilterReport
            && !reportContainsIOUDebt) {
            return;
        }

        if (ReportUtils.isDefaultRoom(report) && (!Permissions.canUseDefaultRooms(betas) || excludeDefaultRooms)) {
            return;
        }

        const reportPersonalDetails = PersonalDetailsUtils.getPersonalDetailsForLogins(logins, personalDetails);

        // Save the report in the map if this is a single participant so we can associate the reportID with the
        // personal detail option later.
        if (logins.length <= 1) {
            reportMapForLogins[logins[0]] = report;
        }
        allReportOptions.push(createOption(reportPersonalDetails, report, {
            showChatPreviewLine,
            forcePolicyNamePreview,
        }));
    });

    const allPersonalDetailsOptions = _.map(personalDetails, personalDetail => (
        createOption([personalDetail], reportMapForLogins[personalDetail.login], {
            showChatPreviewLine,
            forcePolicyNamePreview,
        })
    ));

    // Always exclude already selected options and the currently logged in user
    const loginOptionsToExclude = [...selectedOptions, {login: store.getCurrentUserLogin()}];

    _.each(excludeLogins, (login) => {
        loginOptionsToExclude.push({login});
    });

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
            if (searchValue && !doParticipantNamesMatchSearch(searchValue, reportOption)) {
                continue;
            }

            // If the report is pinned and we are using the option to display pinned reports on top then we need to
            // collect the pinned reports so we can sort them alphabetically once they are collected
            if (prioritizePinnedReports && reportOption.isPinned) {
                pinnedReportOptions.push(reportOption);
            } else if (prioritizeIOUDebts && reportOption.hasOutstandingIOU && !reportOption.isIOUReportOwner) {
                iouDebtReportOptions.push(reportOption);
            } else if (prioritizeReportsWithDraftComments && reportOption.hasDraftComment) {
                draftReportOptions.push(reportOption);
            } else {
                recentReportOptions.push(reportOption);
            }

            // Add this login to the exclude list so it won't appear when we process the personal details
            if (reportOption.login) {
                loginOptionsToExclude.push({login: reportOption.login});
            }
        }
    }

    // If we are prioritizing reports with draft comments, add them before the normal recent report options
    // and sort them by report name.
    if (prioritizeReportsWithDraftComments) {
        const sortedDraftReports = lodashOrderBy(draftReportOptions, ['text'], ['asc']);
        recentReportOptions = sortedDraftReports.concat(recentReportOptions);
    }

    // If we are prioritizing IOUs the user owes, add them before the normal recent report options and reports
    // with draft comments.
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

    // If we are prioritizing 1:1 chats in search, do it only once we started searching
    if (sortByReportTypeInSearch && searchValue !== '') {
        recentReportOptions = lodashOrderBy(recentReportOptions, [(option) => {
            if (option.isDefaultChatRoom || option.isArchivedRoom) {
                return 3;
            }
            if (!option.login) {
                return 2;
            }
            return 1;
        }], ['asc']);
    }

    if (includePersonalDetails) {
        // Next loop over all personal details removing any that are selectedUsers or recentChats
        _.each(allPersonalDetailsOptions, (personalDetailOption) => {
            if (_.some(loginOptionsToExclude, loginOptionToExclude => (
                loginOptionToExclude.login === personalDetailOption.login
            ))) {
                return;
            }
            if (searchValue && !doParticipantNamesMatchSearch(searchValue, personalDetailOption)) {
                return;
            }
            personalDetailsOptions.push(personalDetailOption);
        });
    }

    let userToInvite = null;
    const shouldAddUserToInvite = searchValue
        && recentReportOptions.length === 0
        && personalDetailsOptions.length === 0
        && !isCurrentUser({login: searchValue})
        && _.every(selectedOptions, option => option.login !== searchValue)
        && ((Str.isValidEmail(searchValue) && !Str.isDomainEmail(searchValue)) || Str.isValidPhone(searchValue))
        && (!_.find(loginOptionsToExclude, loginOptionToExclude => loginOptionToExclude.login === searchValue.toLowerCase()))
        && (searchValue !== CONST.EMAIL.CHRONOS || Permissions.canUseChronos(betas));

    if (shouldAddUserToInvite) {
        // If the phone number doesn't have an international code then let's prefix it with the
        // current user's international code based on their IP address.
        const login = (Str.isValidPhone(searchValue) && !searchValue.includes('+'))
            ? `+${store.getCountryCodeByIP()}${searchValue}`
            : searchValue;
        const userInvitePersonalDetails = PersonalDetailsUtils.getPersonalDetailsForLogins([login], personalDetails);
        userToInvite = createOption(userInvitePersonalDetails, null, {
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

export default getOptions;
