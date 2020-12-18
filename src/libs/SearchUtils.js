import _ from 'underscore';
import lodashGet from 'lodash.get';
import lodashOrderBy from 'lodash.orderby';
import Str from 'expensify-common/lib/str';
import CONST from '../CONST';

const MAX_SEARCH_RESULTS = 10;

/**
 * Provided a list of search options and search string this will filter the options.
 *
 * @param {String} searchValue
 * @param {Array} searchOptions
 * @param {Function} [rejectMethod] additional criteria for excluding any items from matches
 */
function filterChatSearchOptions(searchValue, searchOptions, rejectMethod = () => false) {
    // Search our full list of options. We want:
    // 1) Exact matches first
    // 2) beginning-of-string matches second
    // 3) middle-of-string matches last
    const matchRegexes = [
        new RegExp(`^${Str.escapeForRegExp(searchValue)}$`, 'i'),
        new RegExp(`^${Str.escapeForRegExp(searchValue)}`, 'i'),
        new RegExp(Str.escapeForRegExp(searchValue), 'i'),
    ];

    // Because we want to regexes above to be listed in a specific order, the for loop below will end up adding
    // duplicate options to the list (because one option can match multiple regex patterns).
    // A Set is used here so that duplicate values are automatically removed.
    const matches = new Set();

    for (let i = 0; i < matchRegexes.length; i++) {
        if (matches.size < MAX_SEARCH_RESULTS) {
            for (let j = 0; j < searchOptions.length; j++) {
                const option = searchOptions[j];
                const valueToSearch = option.searchText && option.searchText.replace(new RegExp(/&nbsp;/g), '');
                const isMatch = matchRegexes[i].test(valueToSearch);
                const shouldReject = rejectMethod(option);

                // Make sure we don't include the same option twice (automatically handled by using a `Set`)
                if (isMatch && !shouldReject) {
                    matches.add(option);
                }

                if (matches.size === MAX_SEARCH_RESULTS) {
                    break;
                }
            }
        } else {
            break;
        }
    }

    return Array.from(matches);
}

function reportHasMultipleParticipants(report) {
    return lodashGet(report, 'participants', []).length > 1;
}

function isUserReportParticipant(report, login) {
    const participants = lodashGet(report, 'participants', []);
    return _.some(participants, (participantLogin) => participantLogin === login);
}

function getParticipantLogin(report) {
    return lodashGet(report, ['participants', 0], '');
}

function createChatUserOption(personalDetail) {
    return {
        text: personalDetail.displayName,
        alternateText: personalDetail.login,
        searchText: personalDetail.displayName === personalDetail.login ? personalDetail.login
            : `${personalDetail.displayName} ${personalDetail.login}`,
        icon: personalDetail.avatarURL,
        login: personalDetail.login,
        type: CONST.REPORT.SINGLE_USER_DM,
        keyForList: personalDetail.login,
    };
}

function getChatSearchState(personalDetails, reports = {}, selectedUsers = []) {
    // Start by getting the five most recent users that are not already selected
    const orderedReports = lodashOrderBy(reports, ['lastVisitedTimestamp'], ['desc']);
    const recentUsers = [];
    const alreadySelectedUsers = [...selectedUsers];

    for (let i = 0; i < orderedReports.length; i++) {
        if (recentUsers.length === 5) {
            break;
        }

        const report = orderedReports[i];

        // Skip any reports where there are multiple users
        if (reportHasMultipleParticipants(report)) {
            continue;
        }

        // Check the reports that have only one user to see if any of our participants
        // are on this report
        if (_.some(alreadySelectedUsers, login => isUserReportParticipant(report, login))) {
            continue;
        }

        const login = getParticipantLogin(report);
        const personalDetail = personalDetails[login];
        recentUsers.push(createChatUserOption(personalDetail));
        alreadySelectedUsers.push(login);
    }

    const contacts = [];

    // Next loop over all personal details removing any that are selectedUsers or recentUsers
    _.each(personalDetails, (personalDetail, login) => {
        if (_.some(alreadySelectedUsers, (selectedLogin) => selectedLogin === login)) {
            return;
        }

        contacts.push(createChatUserOption(personalDetail));
    });

    return {
        contacts,
        recentUsers,
    };
}

export {
    filterChatSearchOptions,
    getChatSearchState,
};
