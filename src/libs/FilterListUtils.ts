import {Str} from 'expensify-common';
import lodashOrderBy from 'lodash/orderBy';
import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';
import filterArrayByMatch from './filterArrayByMatch';
import * as LoginUtils from './LoginUtils';
import type {FilterOptionsConfig, Option, Options} from './OptionsListUtils';
import * as PersonalDetailsUtils from './PersonalDetailsUtils';
import * as PhoneNumber from './PhoneNumber';
import type * as ReportUtils from './ReportUtils';

// TODO: We only need one small helper function from UserUtils - will webpack optimize all the rest away or will it need to include every import in UserUtils (that would be a waste)

/**
 * Constructs a Set with all possible names (displayName, firstName, lastName, email) for all participants in a report,
 * to be used in isSearchStringMatch.
 */
function getParticipantNames(personalDetailList?: Array<Partial<PersonalDetails>> | null): Set<string> {
    // We use a Set because `Set.has(value)` on a Set of with n entries is up to n (or log(n)) times faster than
    // `_.contains(Array, value)` for an Array with n members.
    const participantNames = new Set<string>();
    personalDetailList?.forEach((participant) => {
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
            participantNames.add(PersonalDetailsUtils.getDisplayNameOrDefault(participant).toLowerCase());
        }
    });
    return participantNames;
}

function getPersonalDetailSearchTerms(item: Partial<ReportUtils.OptionData>) {
    return [item.participantsList?.[0]?.displayName ?? '', item.login ?? '', item.login?.replace(CONST.EMAIL_SEARCH_REGEX, '') ?? ''];
}

function getCurrentUserSearchTerms(item: ReportUtils.OptionData) {
    return [item.text ?? '', item.login ?? '', item.login?.replace(CONST.EMAIL_SEARCH_REGEX, '') ?? ''];
}

/**
 * A very optimized method to remove duplicates from an array.
 * Taken from https://stackoverflow.com/a/9229821/9114791
 */
function uniqFast(items: string[]): string[] {
    const seenItems: Record<string, number> = {};
    const result: string[] = [];
    let j = 0;

    for (const item of items) {
        if (seenItems[item] !== 1) {
            seenItems[item] = 1;
            result[j++] = item;
        }
    }

    return result;
}

function isSearchStringMatch(searchValue: string, searchText?: string | null, participantNames = new Set<string>(), isChatRoom = false): boolean {
    const searchWords = new Set(searchValue.replace(/,/g, ' ').split(' '));
    const valueToSearch = searchText?.replace(new RegExp(/&nbsp;/g), '');
    let matching = true;
    searchWords.forEach((word) => {
        // if one of the word is not matching, we don't need to check further
        if (!matching) {
            return;
        }
        const matchRegex = new RegExp(Str.escapeForRegExp(word), 'i');
        matching = matchRegex.test(valueToSearch ?? '') || (!isChatRoom && participantNames.has(word));
    });
    return matching;
}

/**
 * Options need to be sorted in the specific order
 * @param options - list of options to be sorted
 * @param searchValue - search string
 * @returns a sorted list of options
 */
function orderOptions(options: ReportUtils.OptionData[], searchValue: string | undefined, {preferChatroomsOverThreads = false} = {}) {
    return lodashOrderBy(
        options,
        [
            (option) => {
                if (option.isSelfDM) {
                    return 0;
                }
                if (preferChatroomsOverThreads && option.isThread) {
                    return 4;
                }
                if (!!option.isChatRoom || option.isArchivedRoom) {
                    return 3;
                }
                if (!option.login) {
                    return 2;
                }
                if (option.login.toLowerCase() !== searchValue?.toLowerCase()) {
                    return 1;
                }

                // When option.login is an exact match with the search value, returning 0 puts it at the top of the option list
                return 0;
            },
        ],
        ['asc'],
    );
}

/**
 * Filters options based on the search input value
 */
function filterOptions(options: Options, searchInputValue: string, config?: FilterOptionsConfig): Options {
    const {
        sortByReportTypeInSearch = false,
        canInviteUser = true,
        maxRecentReportsToShow = 0,
        excludeLogins = [],
        preferChatroomsOverThreads = false,
        includeChatRoomsByParticipants = false,
    } = config ?? {};
    if (searchInputValue.trim() === '' && maxRecentReportsToShow > 0) {
        return {...options, recentReports: options.recentReports.slice(0, maxRecentReportsToShow)};
    }

    const parsedPhoneNumber = PhoneNumber.parsePhoneNumber(LoginUtils.appendCountryCode(Str.removeSMSDomain(searchInputValue)));
    const searchValue = parsedPhoneNumber.possible && parsedPhoneNumber.number?.e164 ? parsedPhoneNumber.number.e164 : searchInputValue.toLowerCase();
    const searchTerms = searchValue ? searchValue.split(' ') : [];

    const optionsToExclude: Option[] = [{login: CONST.EMAIL.NOTIFICATIONS}];

    excludeLogins.forEach((login) => {
        optionsToExclude.push({login});
    });

    // Note: this is likely to be removed soon here: https://github.com/Expensify/App/pull/47229
    // const getParticipantsLoginsArray = (item: ReportUtils.OptionData) => {
    //     const keys: string[] = [];
    //     const visibleChatMemberAccountIDs = item.participantsList ?? [];
    //     if (allPersonalDetails) {
    //         visibleChatMemberAccountIDs.forEach((participant) => {
    //             const login = participant?.login;

    //             if (participant?.displayName) {
    //                 keys.push(participant.displayName);
    //             }

    //             if (login) {
    //                 keys.push(login);
    //                 keys.push(login.replace(CONST.EMAIL_SEARCH_REGEX, ''));
    //             }
    //         });
    //     }

    //     return keys;
    // };

    const matchResults = searchTerms.reduceRight((items, term) => {
        const recentReports = filterArrayByMatch(items.recentReports, term, (item) => {
            let values: string[] = [];
            if (item.text) {
                values.push(item.text);
            }

            if (item.login) {
                values.push(item.login);
                values.push(item.login.replace(CONST.EMAIL_SEARCH_REGEX, ''));
            }

            if (item.isThread) {
                if (item.alternateText) {
                    values.push(item.alternateText);
                }
                // values = values.concat(getParticipantsLoginsArray(item));
            } else if (!!item.isChatRoom || !!item.isPolicyExpenseChat) {
                if (item.subtitle) {
                    values.push(item.subtitle);
                }

                // if (includeChatRoomsByParticipants) {
                //     values = values.concat(getParticipantsLoginsArray(item));
                // }
            }

            if (!item.isChatRoom) {
                const participantNames = getParticipantNames(item.participantsList ?? []);
                values = values.concat(Array.from(participantNames));
                // values = values.concat(getParticipantsLoginsArray(item));
            }

            return uniqFast(values);
        });
        console.log('hanno filtering pD', items.personalDetails.length);
        const personalDetails = filterArrayByMatch(items.personalDetails, term, (item) => uniqFast(getPersonalDetailSearchTerms(item)));

        const currentUserOptionSearchText = items.currentUserOption ? uniqFast(getCurrentUserSearchTerms(items.currentUserOption)).join(' ') : '';

        const currentUserOption = isSearchStringMatch(term, currentUserOptionSearchText) ? items.currentUserOption : null;

        return {
            recentReports: recentReports ?? [],
            personalDetails: personalDetails ?? [],
            userToInvite: null,
            currentUserOption,
            categoryOptions: [],
            tagOptions: [],
            taxRatesOptions: [],
        };
    }, options);

    let {recentReports, personalDetails} = matchResults;

    if (sortByReportTypeInSearch) {
        recentReports = recentReports.concat(personalDetails);
        personalDetails = [];
        recentReports = orderOptions(recentReports, searchValue);
    }

    const userToInvite = null;
    // TODO: migrate
    // if (canInviteUser) {
    //     if (recentReports.length === 0 && personalDetails.length === 0) {
    //         userToInvite = getUserToInviteOption({
    //             searchValue,
    //             betas,
    //             selectedOptions: config?.selectedOptions,
    //             optionsToExclude,
    //         });
    //     }
    // }

    if (maxRecentReportsToShow > 0 && recentReports.length > maxRecentReportsToShow) {
        recentReports.splice(maxRecentReportsToShow);
    }

    return {
        personalDetails,
        recentReports: orderOptions(recentReports, searchValue, {preferChatroomsOverThreads}),
        userToInvite,
        currentUserOption: matchResults.currentUserOption,
        categoryOptions: [],
        tagOptions: [],
        taxRatesOptions: [],
    };
}

export {filterOptions};
