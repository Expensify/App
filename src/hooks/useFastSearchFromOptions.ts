import deburr from 'lodash/deburr';
import {useCallback, useEffect, useRef, useState} from 'react';
import {InteractionManager} from 'react-native';
import Timing from '@libs/actions/Timing';
import FastSearch from '@libs/FastSearch';
import Log from '@libs/Log';
import type {Options as OptionsListType, ReportAndPersonalDetailOptions} from '@libs/OptionsListUtils';
import {filterUserToInvite, isSearchStringMatch} from '@libs/OptionsListUtils';
import Performance from '@libs/Performance';
import type {OptionData} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import CONST from '@src/CONST';
import useLocalize from './useLocalize';

type Options = {
    includeUserToInvite: boolean;
};

const emptyResult = {
    personalDetails: [],
    recentReports: [],
    userToInvite: null,
    currentUserOption: undefined,
};

const personalDetailToSearchString = (option: OptionData) => {
    const displayName = option.participantsList?.[0]?.displayName ?? '';
    return deburr([option.login ?? '', option.login !== displayName ? displayName : ''].join());
};

const recentReportToSearchString = (option: OptionData) => {
    const searchStringForTree = [option.text ?? '', option.login ?? ''];

    if (option.isThread) {
        searchStringForTree.push(option.alternateText ?? '');
    } else if (option.isChatRoom) {
        searchStringForTree.push(option.subtitle ?? '');
    } else if (option.isPolicyExpenseChat) {
        searchStringForTree.push(...[option.subtitle ?? '', option.policyName ?? '']);
    }

    return deburr(searchStringForTree.join());
};

const getPersonalDetailUniqueId = (option: OptionData) => {
    return option.login ? `personalDetail-${option.login}` : undefined;
};

const getRecentReportUniqueId = (option: OptionData) => {
    return option.reportID ? `recentReport-${option.reportID}` : undefined;
};

// You can either use this to search within report and personal details options
function useFastSearchFromOptions(
    options: ReportAndPersonalDetailOptions,
    config?: {includeUserToInvite: false},
): {search: (searchInput: string) => ReportAndPersonalDetailOptions; isInitialized: boolean};
// Or you can use this to include the user invite option. This will require passing all options
function useFastSearchFromOptions(
    options: OptionsListType,
    config?: {includeUserToInvite: true},
): {
    search: (searchInput: string) => OptionsListType;
    isInitialized: boolean;
};

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
): {search: (searchInput: string) => OptionsListType; isInitialized: boolean} {
    const [fastSearch, setFastSearch] = useState<ReturnType<typeof FastSearch.createFastSearch<OptionData>> | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const prevOptionsRef = useRef<typeof options | null>(null);
    const prevFastSearchRef = useRef<ReturnType<typeof FastSearch.createFastSearch<OptionData>> | null>(null);
    const {formatPhoneNumber} = useLocalize();
    useEffect(() => {
        let newFastSearch: ReturnType<typeof FastSearch.createFastSearch<OptionData>>;
        const prevOptions = prevOptionsRef.current;
        if (prevOptions && shallowCompareOptions(prevOptions, options)) {
            return;
        }

        const actionId = `fast_search_tree_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        InteractionManager.runAfterInteractions(() => {
            const startTime = Date.now();

            Performance.markStart(CONST.TIMING.FAST_SEARCH_TREE_CREATION);
            Log.info('[CMD_K_DEBUG] FastSearch tree creation started', false, {
                actionId,
                personalDetailsCount: options.personalDetails.length,
                recentReportsCount: options.recentReports.length,
                hasExistingTree: !!prevFastSearchRef.current,
                timestamp: startTime,
            });

            try {
                prevOptionsRef.current = options;

                // Dispose existing tree if present
                if (prevFastSearchRef.current) {
                    const disposeStartTime = Date.now();
                    try {
                        prevFastSearchRef.current.dispose();
                        Log.info('[CMD_K_DEBUG] FastSearch tree disposed (reason: recreate)', false, {
                            actionId,
                            disposeTime: Date.now() - disposeStartTime,
                            timestamp: Date.now(),
                        });
                    } catch (error) {
                        Log.alert('[CMD_K_FREEZE] FastSearch tree disposed (reason: recreate) failed', {
                            actionId,
                            error: String(error),
                            timestamp: Date.now(),
                        });
                    }
                }

                newFastSearch = FastSearch.createFastSearch(
                    [
                        {
                            data: options.personalDetails,
                            toSearchableString: personalDetailToSearchString,
                            uniqueId: getPersonalDetailUniqueId,
                        },
                        {
                            data: options.recentReports,
                            toSearchableString: recentReportToSearchString,
                            uniqueId: getRecentReportUniqueId,
                        },
                    ],

                    {shouldStoreSearchableStrings: true},
                );

                setFastSearch(newFastSearch);
                prevFastSearchRef.current = newFastSearch;
                setIsInitialized(true);

                const endTime = Date.now();
                Performance.markEnd(CONST.TIMING.FAST_SEARCH_TREE_CREATION);
                Log.info('[CMD_K_DEBUG] FastSearch tree creation completed', false, {
                    actionId,
                    duration: endTime - startTime,
                    totalItems: options.personalDetails.length + options.recentReports.length,
                    isInitialized: true,
                    timestamp: endTime,
                });
            } catch (error) {
                const endTime = Date.now();
                Performance.markEnd(CONST.TIMING.FAST_SEARCH_TREE_CREATION);
                Log.alert('[CMD_K_FREEZE] FastSearch tree creation failed', {
                    actionId,
                    error: String(error),
                    duration: endTime - startTime,
                    personalDetailsCount: options.personalDetails.length,
                    recentReportsCount: options.recentReports.length,
                    timestamp: endTime,
                });
                throw error;
            }
        });
    }, [options]);

    useEffect(
        () => () => {
            try {
                Log.info('[CMD_K_DEBUG] FastSearch tree cleanup (reason: unmount)', false, {
                    timestamp: Date.now(),
                });
                prevFastSearchRef.current?.dispose();
            } catch (error) {
                Log.alert('[CMD_K_FREEZE] FastSearch tree cleanup (reason: unmount) failed', {
                    error: String(error),
                    timestamp: Date.now(),
                });
            }
        },
        [],
    );

    const findInSearchTree = useCallback(
        (searchInput: string): OptionsListType => {
            if (!fastSearch) {
                return emptyResult;
            }
            const deburredInput = deburr(searchInput);
            const searchWords = deburredInput.split(/\s+/);
            const searchWordsSorted = StringUtils.sortStringArrayByLength(searchWords);
            const longestSearchWord = searchWordsSorted.at(searchWordsSorted.length - 1); // longest word is the last element
            if (!longestSearchWord) {
                return emptyResult;
            }

            // The user might have separated words with spaces to do a search such as: "jo d" -> "john doe"
            // With the suffix search tree you can only search for one word at a time. Its most efficient to search for the longest word,
            // (as this will limit the results the most) and then afterwards run a quick filter on the results to see if the other words are present.
            let [personalDetails, recentReports] = fastSearch.search(longestSearchWord);

            if (searchWords.length > 1) {
                personalDetails = personalDetails.filter((pd) => {
                    const id = getPersonalDetailUniqueId(pd);
                    const searchableString = id ? fastSearch.searchableStringsMap.get(id) : deburr(pd.text);
                    return isSearchStringMatch(deburredInput, searchableString);
                });
                recentReports = recentReports.filter((rr) => {
                    const id = getRecentReportUniqueId(rr);
                    const searchableString = id ? fastSearch.searchableStringsMap.get(id) : deburr(rr.text);
                    return isSearchStringMatch(deburredInput, searchableString);
                });
            }

            if (includeUserToInvite && 'currentUserOption' in options) {
                const userToInvite = filterUserToInvite(
                    {
                        ...options,
                        personalDetails,
                        recentReports,
                    },
                    searchInput,
                    formatPhoneNumber,
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
                userToInvite: null,
                currentUserOption: undefined,
            };
        },
        [includeUserToInvite, options, fastSearch],
    );

    return {search: findInSearchTree, isInitialized};
}

/**
 * Compares two ReportAndPersonalDetailOptions objects shallowly.
 * @returns true if the options are shallowly equal, false otherwise.
 */
function shallowCompareOptions(prev: ReportAndPersonalDetailOptions, next: ReportAndPersonalDetailOptions): boolean {
    if (!prev || !next) {
        return false;
    }

    // Compare lengths first
    if (prev.personalDetails.length !== next.personalDetails.length || prev.recentReports.length !== next.recentReports.length) {
        return false;
    }
    Timing.start(CONST.TIMING.SEARCH_OPTIONS_COMPARISON);
    Performance.markStart(CONST.TIMING.SEARCH_OPTIONS_COMPARISON);

    for (let i = 0; i < prev.personalDetails.length; i++) {
        if (prev.personalDetails.at(i)?.keyForList !== next.personalDetails.at(i)?.keyForList) {
            Timing.end(CONST.TIMING.SEARCH_OPTIONS_COMPARISON);
            Performance.markEnd(CONST.TIMING.SEARCH_OPTIONS_COMPARISON);
            return false;
        }
    }

    for (let i = 0; i < prev.recentReports.length; i++) {
        if (prev.recentReports.at(i)?.keyForList !== next.recentReports.at(i)?.keyForList) {
            Timing.end(CONST.TIMING.SEARCH_OPTIONS_COMPARISON);
            Performance.markEnd(CONST.TIMING.SEARCH_OPTIONS_COMPARISON);
            return false;
        }
    }
    Timing.end(CONST.TIMING.SEARCH_OPTIONS_COMPARISON);
    Performance.markEnd(CONST.TIMING.SEARCH_OPTIONS_COMPARISON);
    return true;
}

export default useFastSearchFromOptions;
