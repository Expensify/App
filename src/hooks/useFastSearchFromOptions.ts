import {useMemo} from 'react';
import FastSearch from '@libs/FastSearch';
import * as OptionsListUtils from '@libs/OptionsListUtils';

type AllOrSelectiveOptions = OptionsListUtils.ReportAndPersonalDetailOptions | OptionsListUtils.Options;

type Options = {
    includeUserToInvite: boolean;
};

const emptyResult = {
    personalDetails: [],
    recentReports: [],
};

// You can either use this to search within report and personal details options
function useFastSearchFromOptions(
    options: OptionsListUtils.ReportAndPersonalDetailOptions,
    config?: {includeUserToInvite: false},
): (searchInput: string) => OptionsListUtils.ReportAndPersonalDetailOptions;
// Or you can use this to include the user invite option. This will require passing all options
function useFastSearchFromOptions(options: OptionsListUtils.Options, config?: {includeUserToInvite: true}): (searchInput: string) => OptionsListUtils.Options;

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
    options: OptionsListUtils.ReportAndPersonalDetailOptions | OptionsListUtils.Options,
    {includeUserToInvite}: Options = {includeUserToInvite: false},
): (searchInput: string) => AllOrSelectiveOptions {
    const findInSearchTree = useMemo(() => {
        const fastSearch = FastSearch.createFastSearch([
            {
                data: options.personalDetails,
                toSearchableString: (option) => {
                    const displayName = option.participantsList?.[0]?.displayName ?? '';
                    return [option.login ?? '', option.login !== displayName ? displayName : ''].join();
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

                    return searchStringForTree.join();
                },
            },
        ]);

        function search(searchInput: string): AllOrSelectiveOptions {
            const searchWords = searchInput.split(' ').sort(); // asc sorted
            const longestSearchWord = searchWords.at(searchWords.length - 1); // longest word is the last element
            if (!longestSearchWord) {
                return emptyResult;
            }

            // The user might separated words with spaces to do a search such as: "jo d" -> "john doe"
            // With the suffix search tree you can only search for one word at a time. Its most efficient to search for the longest word,
            // (as this will limit the results the most) and then afterwards run a quick filter on the results to see if the other words are present.
            let [personalDetails, recentReports] = fastSearch.search(longestSearchWord);

            if (searchWords.length > 1) {
                personalDetails = personalDetails.filter((pd) => OptionsListUtils.isSearchStringMatch(searchInput, pd.text));
                recentReports = recentReports.filter((rr) => OptionsListUtils.isSearchStringMatch(searchInput, rr.text));
            }

            if (includeUserToInvite && 'currentUserOption' in options) {
                const userToInvite = OptionsListUtils.filterUserToInvite(
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
