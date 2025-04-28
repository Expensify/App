import deburr from 'lodash/deburr';
import {useMemo} from 'react';
import FastSearch from '@libs/FastSearch';
import {filterUserToInvite, isSearchStringMatch} from '@libs/OptionsListUtils';
import type {Options as OptionsListType, ReportAndPersonalDetailOptions} from '@libs/OptionsListUtils';
import StringUtils from '@libs/StringUtils';

type AllOrSelectiveOptions = ReportAndPersonalDetailOptions | OptionsListType;

type Options = {
    includeUserToInvite: boolean;
};

const emptyResult = {
    personalDetails: [],
    recentReports: [],
};

// You can either use this to search within report and personal details options
function useFastSearchFromOptions(options: ReportAndPersonalDetailOptions, config?: {includeUserToInvite: false}): (searchInput: string) => ReportAndPersonalDetailOptions;
// Or you can use this to include the user invite option. This will require passing all options
function useFastSearchFromOptions(options: OptionsListType, config?: {includeUserToInvite: true}): (searchInput: string) => OptionsListType;

/**
 * Hook for making options from OptionsListUtils searchable with FastSearch.
 * Builds a suffix tree and returns a function to search in it.
 *
 * @example
 * ```
 * const options = OptionsListUtils.getSearchOptions(...);
 * const filterOptions = useFastSearchFromOptions(options);
 */
function useFastSearchFromOptions(
    options: ReportAndPersonalDetailOptions | OptionsListType,
    {includeUserToInvite}: Options = {includeUserToInvite: false},
): (searchInput: string) => AllOrSelectiveOptions {
    const findInSearchTree = useMemo(() => {
        const fastSearch = FastSearch.createFastSearch([
            {
                data: options.personalDetails,
                toSearchableString: (option) => {
                    const displayName = option.participantsList?.[0]?.displayName ?? '';
                    return deburr([option.login ?? '', option.login !== displayName ? displayName : ''].join());
                },
                uniqueId: (option) => option.login,
            },
            {
                data: options.recentReports,
                toSearchableString: (option) => {
                    const searchStringForTree = [option.text ?? '', option.login ?? ''];

                    if (option.isThread) {
                        if (option.alternateText) {
                            searchStringForTree.push(option.alternateText);
                        }
                    } else if (!!option.isChatRoom || !!option.isPolicyExpenseChat) {
                        if (option.subtitle) {
                            searchStringForTree.push(option.subtitle);
                        }
                    }

                    return deburr(searchStringForTree.join());
                },
            },
        ]);

        function search(searchInput: string): AllOrSelectiveOptions {
            const deburredInput = deburr(searchInput);
            const searchWords = deburredInput.split(/\s+/);
            const searchWordsSorted = StringUtils.sortStringArrayByLength(searchWords);
            const longestSearchWord = searchWordsSorted.at(searchWordsSorted.length - 1); // longest word is the last element
            if (!longestSearchWord) {
                return emptyResult;
            }

            // The user might separated words with spaces to do a search such as: "jo d" -> "john doe"
            // With the suffix search tree you can only search for one word at a time. Its most efficient to search for the longest word,
            // (as this will limit the results the most) and then afterwards run a quick filter on the results to see if the other words are present.
            let [personalDetails, recentReports] = fastSearch.search(longestSearchWord);

            if (searchWords.length > 1) {
                personalDetails = personalDetails.filter((pd) => isSearchStringMatch(deburredInput, deburr(pd.text)));
                recentReports = recentReports.filter((rr) => isSearchStringMatch(deburredInput, deburr(rr.text)));
            }

            if (includeUserToInvite && 'currentUserOption' in options) {
                const userToInvite = filterUserToInvite(
                    {
                        ...options,
                        personalDetails,
                        recentReports,
                    },
                    searchInput,
                );
                return {
                    personalDetails,
                    recentReports,
                    userToInvite,
                    currentUserOption: options.currentUserOption,
                };
            }

            return {
                personalDetails,
                recentReports,
            };
        }

        return search;
    }, [includeUserToInvite, options]);

    return findInSearchTree;
}

export default useFastSearchFromOptions;
