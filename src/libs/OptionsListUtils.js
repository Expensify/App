/* eslint-disable no-continue */
import _ from 'underscore';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import lodashOrderBy from 'lodash/orderBy';
import Str from 'expensify-common/lib/str';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import * as ReportUtils from './reportUtils';
import * as Localize from './Localize';
import Permissions from './Permissions';
import md5 from './md5';
import * as Expensicons from '../components/Icon/Expensicons';

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

let loginList;
Onyx.connect({
    key: ONYXKEYS.LOGIN_LIST,
    callback: val => loginList = _.isEmpty(val) ? [] : val,
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

const reportsWithDraft = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORTS_WITH_DRAFT,
    callback: (hasDraft, key) => {
        if (!key) {
            return;
        }

        reportsWithDraft[key] = hasDraft;
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

let formattedPersonalDetails;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS,
    callback: val => formattedPersonalDetails = val,
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
                login,
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
 * @param {Boolean} isChatRoomOrPolicyExpenseChat
 * @return {String}
 */
function getSearchText(report, personalDetailList, isChatRoomOrPolicyExpenseChat) {
    const searchTerms = [];

    if (!isChatRoomOrPolicyExpenseChat) {
        _.each(personalDetailList, (personalDetail) => {
            searchTerms.push(personalDetail.displayName);
            searchTerms.push(personalDetail.login);
        });
    }
    if (report) {
        searchTerms.push(...report.reportName);
        searchTerms.push(..._.map(report.reportName.split(','), name => name.trim()));

        if (isChatRoomOrPolicyExpenseChat) {
            const chatRoomSubtitle = ReportUtils.getChatRoomSubtitle(report, policies);
            searchTerms.push(...chatRoomSubtitle);
            searchTerms.push(..._.map(chatRoomSubtitle.split(','), name => name.trim()));
        } else {
            searchTerms.push(...report.participants);
        }
    }

    return _.unique(searchTerms).join(' ');
}

/**
 * Determines whether a report has a draft comment.
 *
 * @param {Object} report
 * @return {Boolean}
 */
function hasReportDraftComment(report) {
    return report
        && reportsWithDraft
        && lodashGet(reportsWithDraft, `${ONYXKEYS.COLLECTION.REPORTS_WITH_DRAFT}${report.reportID}`, false);
}

/**
 * Returns the appropriate icons for the given chat report using the stored personalDetails.
 * The Avatar sources can be URLs or Icon components according to the chat type.
 *
 * @param {Object} report
 * @returns {Array<*>}
 */
function getReportIcons(report) {
    if (!report) {
        return [getDefaultAvatar()];
    }
    if (ReportUtils.isArchivedRoom(report)) {
        return [Expensicons.DeletedRoomAvatar];
    }
    if (ReportUtils.isAdminRoom(report)) {
        return [Expensicons.AdminRoomAvatar];
    }
    if (ReportUtils.isAnnounceRoom(report)) {
        return [Expensicons.AnnounceRoomAvatar];
    }
    if (ReportUtils.isChatRoom(report)) {
        return [Expensicons.ActiveRoomAvatar];
    }
    if (ReportUtils.isPolicyExpenseChat(report)) {
        const policyExpenseChatAvatarSource = lodashGet(policies, [
            `${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`, 'avatarURL',
        ]) || Expensicons.Workspace;

        // Return the workspace avatar if the user is the owner of the policy expense chat
        if (report.isOwnPolicyExpenseChat) {
            return [policyExpenseChatAvatarSource];
        }

        // If the user is an admin, return avatar source of the other participant of the report
        // (their workspace chat) and the avatar source of the workspace
        return [
            lodashGet(formattedPersonalDetails, [report.ownerEmail, 'avatar']) || getDefaultAvatar(report.ownerEmail),
            policyExpenseChatAvatarSource,
        ];
    }

    // Return avatar sources for Group chats
    const sortedParticipants = _.map(report.participants, dmParticipant => ({
        firstName: lodashGet(formattedPersonalDetails, [dmParticipant, 'firstName'], ''),
        avatar: lodashGet(formattedPersonalDetails, [dmParticipant, 'avatar']) || getDefaultAvatar(dmParticipant),
    })).sort((first, second) => first.firstName - second.firstName);
    return _.map(sortedParticipants, item => item.avatar);
}

/**
 * Creates a report list option
 *
 * @param {Array<Object>} personalDetailList
 * @param {Object} report
 * @param {Object} options
 * @param {Boolean} [options.showChatPreviewLine]
 * @param {Boolean} [options.forcePolicyNamePreview]
 * @returns {Object}
 */
function createOption(personalDetailList, report, {
    showChatPreviewLine = false, forcePolicyNamePreview = false,
}) {
    const isChatRoom = ReportUtils.isChatRoom(report);
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(report);
    const hasMultipleParticipants = personalDetailList.length > 1 || isChatRoom || isPolicyExpenseChat;
    const personalDetail = personalDetailList[0];
    const hasDraftComment = hasReportDraftComment(report);
    const hasOutstandingIOU = lodashGet(report, 'hasOutstandingIOU', false);
    const iouReport = hasOutstandingIOU
        ? lodashGet(iouReports, `${ONYXKEYS.COLLECTION.REPORT_IOUS}${report.iouReportID}`, {})
        : {};

    const lastActorDetails = report ? _.find(personalDetailList, {login: report.lastActorEmail}) : null;
    const lastMessageTextFromReport = ReportUtils.isReportMessageAttachment(lodashGet(report, 'lastMessageText', ''))
        ? `[${Localize.translateLocal('common.attachment')}]`
        : Str.htmlDecode(lodashGet(report, 'lastMessageText', ''));
    let lastMessageText = report && hasMultipleParticipants && lastActorDetails
        ? `${lastActorDetails.displayName}: `
        : '';
    lastMessageText += report ? lastMessageTextFromReport : '';

    const tooltipText = ReportUtils.getReportParticipantsTitle(lodashGet(report, ['participants'], []));
    const subtitle = ReportUtils.getChatRoomSubtitle(report, policies);
    let icons = getReportIcons(report);
    let text;
    let alternateText;
    if (isChatRoom || isPolicyExpenseChat) {
        text = lodashGet(report, ['reportName'], '');
        alternateText = (showChatPreviewLine && !forcePolicyNamePreview && lastMessageText)
            ? lastMessageText
            : subtitle;
    } else {
        text = hasMultipleParticipants
            ? _.map(personalDetailList, ({firstName, login}) => firstName || Str.removeSMSDomain(login))
                .join(', ')
            : lodashGet(report, ['reportName'], personalDetail.displayName);
        alternateText = (showChatPreviewLine && lastMessageText)
            ? lastMessageText
            : Str.removeSMSDomain(personalDetail.login);
        if (!report) {
            // If the report doesn't exist then we're creating a list of users to invite (using the personalDetailList)
            icons = [personalDetail.avatar];
        }
    }
    return {
        text,
        alternateText,
        icons,
        tooltipText,
        ownerEmail: lodashGet(report, ['ownerEmail']),
        subtitle,
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
        searchText: getSearchText(report, personalDetailList, isChatRoom || isPolicyExpenseChat),
        isPinned: lodashGet(report, 'isPinned', false),
        hasOutstandingIOU,
        iouReportID: lodashGet(report, 'iouReportID'),
        isIOUReportOwner: lodashGet(iouReport, 'ownerEmail', '') === currentUserLogin,
        iouReportAmount: lodashGet(iouReport, 'total', 0),
        isChatRoom,
        isArchivedRoom: ReportUtils.isArchivedRoom(report),
        shouldShowSubscript: isPolicyExpenseChat && !report.isOwnPolicyExpenseChat,
        isPolicyExpenseChat,
    };
}

/**
 * Searches for a match when provided with a value
 *
 * @param {String} searchValue
 * @param {String} searchText
 * @param {Set<String>} [participantNames]
 * @param {Boolean} isChatRoom
 * @returns {Boolean}
 */
function isSearchStringMatch(searchValue, searchText, participantNames = new Set(), isChatRoom = false) {
    const searchWords = _.map(
        searchValue
            .replace(/,/g, ' ')
            .split(' '),
        word => word.trim(),
    );
    return _.every(searchWords, (word) => {
        const matchRegex = new RegExp(Str.escapeForRegExp(word), 'i');
        const valueToSearch = searchText && searchText.replace(new RegExp(/&nbsp;/g), '');
        return matchRegex.test(valueToSearch) || (!isChatRoom && participantNames.has(word));
    });
}

/**
 * Returns the given userDetails is currentUser or not.
 * @param {Object} userDetails
 * @returns {Boolean}
 */

function isCurrentUser(userDetails) {
    if (!userDetails) {
        // If userDetails is null or undefined
        return false;
    }

    // If user login is mobile number, append sms domain if not appended already.
    const userDetailsLogin = addSMSDomainIfPhoneNumber(userDetails.login);

    // Initial check with currentUserLogin
    let result = currentUserLogin.toLowerCase() === userDetailsLogin.toLowerCase();
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

    // When sortByReportTypeInSearch flag is true, recentReports will include the personalDetails options as well.
    sortByReportTypeInSearch = false,
    sortByLastMessageTimestamp = false,
    searchValue = '',
    showChatPreviewLine = false,
    showReportsWithNoComments = false,
    hideReadReports = false,
    sortByAlphaAsc = false,
    forcePolicyNamePreview = false,
    prioritizeIOUDebts = false,
    prioritizeReportsWithDraftComments = false,
}) {
    let recentReportOptions = [];
    const pinnedReportOptions = [];
    let personalDetailsOptions = [];
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
    let orderedReports = lodashOrderBy(reports, sortProperty, sortDirection);

    // Move the archived Rooms to the last
    orderedReports = _.sortBy(orderedReports, report => ReportUtils.isArchivedRoom(report));

    const allReportOptions = [];
    _.each(orderedReports, (report) => {
        const isChatRoom = ReportUtils.isChatRoom(report);
        const isDefaultRoom = ReportUtils.isDefaultRoom(report);
        const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(report);
        const logins = lodashGet(report, ['participants'], []);

        // Report data can sometimes be incomplete. If we have no logins or reportID then we will skip this entry.
        const shouldFilterNoParticipants = _.isEmpty(logins) && !isChatRoom && !isDefaultRoom && !isPolicyExpenseChat;
        if (!report || !report.reportID || shouldFilterNoParticipants) {
            return;
        }

        const hasDraftComment = hasReportDraftComment(report);
        const iouReportOwner = lodashGet(report, 'hasOutstandingIOU', false)
            ? lodashGet(iouReports, [`${ONYXKEYS.COLLECTION.REPORT_IOUS}${report.iouReportID}`, 'ownerEmail'], '')
            : '';

        const reportContainsIOUDebt = iouReportOwner && iouReportOwner !== currentUserLogin;
        const shouldFilterReportIfEmpty = !showReportsWithNoComments && report.lastMessageTimestamp === 0 && !isDefaultRoom;
        const shouldFilterReportIfRead = hideReadReports && report.unreadActionCount === 0;
        const shouldFilterReport = shouldFilterReportIfEmpty || shouldFilterReportIfRead;
        if (report.reportID !== activeReportID
            && !report.isPinned
            && !hasDraftComment
            && shouldFilterReport
            && !reportContainsIOUDebt) {
            return;
        }

        if (isChatRoom && (!Permissions.canUseDefaultRooms(betas) || excludeDefaultRooms)) {
            return;
        }

        if (isPolicyExpenseChat && !Permissions.canUsePolicyExpenseChat(betas)) {
            return;
        }

        if (ReportUtils.isUserCreatedPolicyRoom(report) && !Permissions.canUsePolicyRooms(betas)) {
            return;
        }

        const reportPersonalDetails = getPersonalDetailsForLogins(logins, personalDetails);

        // Save the report in the map if this is a single participant so we can associate the reportID with the
        // personal detail option later. Individuals should not be associated with single participant
        // policyExpenseChats or chatRooms since those are not people.
        if (logins.length <= 1 && !ReportUtils.isPolicyExpenseChat(report) && !ReportUtils.isChatRoom(report)) {
            reportMapForLogins[logins[0]] = report;
        }
        const isSearchingSomeonesPolicyExpenseChat = !report.isOwnPolicyExpenseChat && searchValue !== '';
        allReportOptions.push(createOption(reportPersonalDetails, report, {
            showChatPreviewLine,
            forcePolicyNamePreview: isPolicyExpenseChat ? isSearchingSomeonesPolicyExpenseChat : forcePolicyNamePreview,
        }));
    });

    const allPersonalDetailsOptions = _.map(personalDetails, personalDetail => (
        createOption([personalDetail], reportMapForLogins[personalDetail.login], {
            showChatPreviewLine,
            forcePolicyNamePreview,
        })
    ));

    // Always exclude already selected options and the currently logged in user
    const loginOptionsToExclude = [...selectedOptions, {login: currentUserLogin}];

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
            const {searchText, participantsList, isChatRoom} = reportOption;
            const participantNames = getParticipantNames(participantsList);
            if (searchValue && !isSearchStringMatch(searchValue, searchText, participantNames, isChatRoom)) {
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
        const reportsSplitByDefaultChatRoom = _.partition(recentReportOptions, option => option.isChatRoom);
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
            const {searchText, participantsList, isChatRoom} = personalDetailOption;
            const participantNames = getParticipantNames(participantsList);
            if (searchValue && !isSearchStringMatch(searchValue, searchText, participantNames, isChatRoom)) {
                return;
            }
            personalDetailsOptions.push(personalDetailOption);
        });
    }

    let userToInvite = null;
    if (searchValue
        && recentReportOptions.length === 0
        && personalDetailsOptions.length === 0
        && !isCurrentUser({login: searchValue})
        && _.every(selectedOptions, option => option.login !== searchValue)
        && ((Str.isValidEmail(searchValue) && !Str.isDomainEmail(searchValue)) || Str.isValidPhone(searchValue))
        && (!_.find(loginOptionsToExclude, loginOptionToExclude => loginOptionToExclude.login === searchValue.toLowerCase()))
        && (searchValue !== CONST.EMAIL.CHRONOS || Permissions.canUseChronos(betas))
    ) {
        // If the phone number doesn't have an international code then let's prefix it with the
        // current user's international code based on their IP address.
        const login = (Str.isValidPhone(searchValue) && !searchValue.includes('+'))
            ? `+${countryCodeByIP}${searchValue}`
            : searchValue;
        const userInvitePersonalDetails = getPersonalDetailsForLogins([login], personalDetails);
        userToInvite = createOption(userInvitePersonalDetails, null, {
            showChatPreviewLine,
        });
        userToInvite.icons = [defaultAvatarForUserToInvite];
    }

    // If we are prioritizing 1:1 chats in search, do it only once we started searching
    if (sortByReportTypeInSearch && searchValue !== '') {
        // When sortByReportTypeInSearch is true, recentReports will be returned with all the reports including personalDetailsOptions in the correct Order.
        recentReportOptions.push(...personalDetailsOptions);
        personalDetailsOptions = [];
        recentReportOptions = lodashOrderBy(recentReportOptions, [(option) => {
            if (option.isChatRoom || option.isArchivedRoom) {
                return 3;
            }
            if (!option.login) {
                return 2;
            }
            return 1;
        }], ['asc']);
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
    return getOptions(reports, personalDetails, 0, {
        betas,
        searchValue: searchValue.trim(),
        includeRecentReports: true,
        includeMultipleParticipantReports: true,
        maxRecentReportsToShow: 0, // Unlimited
        prioritizePinnedReports: false,
        prioritizeDefaultRoomsInSearch: false,
        sortByReportTypeInSearch: true,
        showChatPreviewLine: true,
        showReportsWithNoComments: true,
        includePersonalDetails: true,
        sortByLastMessageTimestamp: false,
        forcePolicyNamePreview: true,
        prioritizeIOUDebts: false,
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
    return _.map(participants, participant => ({
        ...participant, descriptiveText: amountText,
    }));
}

/**
 * Build the options for the New Group view
 *
 * @param {Object} reports
 * @param {Object} personalDetails
 * @param {Array<String>} betas
 * @param {String} searchValue
 * @param {Array} selectedOptions
 * @param {Array} excludeLogins
 * @returns {Object}
 */
function getNewChatOptions(
    reports,
    personalDetails,
    betas = [],
    searchValue = '',
    selectedOptions = [],
    excludeLogins = [],
) {
    return getOptions(reports, personalDetails, 0, {
        betas,
        searchValue: searchValue.trim(),
        selectedOptions,
        excludeDefaultRooms: true,
        includeRecentReports: true,
        includePersonalDetails: true,
        maxRecentReportsToShow: 5,
        excludeLogins,
    });
}

/**
 * Build the options for the Sidebar a.k.a. LHN
 *
 * @param {Object} reports
 * @param {Object} personalDetails
 * @param {Number} activeReportID
 * @param {String} priorityMode
 * @param {Array<String>} betas
 * @returns {Object}
 */
function getSidebarOptions(
    reports,
    personalDetails,
    activeReportID,
    priorityMode,
    betas,
) {
    let sideBarOptions = {
        prioritizeIOUDebts: true,
        prioritizeReportsWithDraftComments: true,
    };
    if (priorityMode === CONST.PRIORITY_MODE.GSD) {
        sideBarOptions = {
            hideReadReports: true,
            sortByAlphaAsc: true,
        };
    }

    return getOptions(reports, personalDetails, activeReportID, {
        betas,
        includeRecentReports: true,
        includeMultipleParticipantReports: true,
        maxRecentReportsToShow: 0, // Unlimited
        sortByLastMessageTimestamp: true,
        showChatPreviewLine: true,
        prioritizePinnedReports: true,
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
        return Localize.translate(preferredLocale, 'messages.maxParticipantsReached');
    }

    if (searchValue && CONST.REGEX.DIGITS_AND_PLUS.test(searchValue) && !Str.isValidPhone(searchValue)) {
        return Localize.translate(preferredLocale, 'messages.errorMessageInvalidPhone');
    }

    // Without a search value, it would be very confusing to see a search validation message.
    // Therefore, this skips the validation when there is no search value.
    if (searchValue && !hasSelectableOptions && !hasUserToInvite) {
        if (/^\d+$/.test(searchValue)) {
            return Localize.translate(preferredLocale, 'messages.errorMessageInvalidPhone');
        }

        return Localize.translate(preferredLocale, 'common.noResultsFound');
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
    const filteredOptions = _.filter(currencyOptions, currencyOption => (
        isSearchStringMatch(searchValue, currencyOption.searchText)));

    return {
        // returns filtered options i.e. options with string match if search text is entered
        currencyOptions: filteredOptions,
    };
}

export {
    addSMSDomainIfPhoneNumber,
    isCurrentUser,
    getReportIcons,
    getSearchOptions,
    getNewChatOptions,
    getSidebarOptions,
    getHeaderMessage,
    getPersonalDetailsForLogins,
    getCurrencyListForSections,
    getIOUConfirmationOptionsFromMyPersonalDetail,
    getIOUConfirmationOptionsFromParticipants,
    getDefaultAvatar,
};
