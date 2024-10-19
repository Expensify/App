import {useNavigationState} from '@react-navigation/native';
import debounce from 'lodash/debounce';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useOptionsList} from '@components/OptionListContextProvider';
import type {SearchQueryJSON} from '@components/Search/types';
import type {SelectionListHandle} from '@components/SelectionList/types';
import useDebouncedState from '@hooks/useDebouncedState';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import FastSearch from '@libs/FastSearch';
import Log from '@libs/Log';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import {getAllTaxRates} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import * as SearchUtils from '@libs/SearchUtils';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import * as Report from '@userActions/Report';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SearchRouterInput from './SearchRouterInput';
import SearchRouterList from './SearchRouterList';

const SEARCH_DEBOUNCE_DELAY = 150;

type SearchRouterProps = {
    onRouterClose: () => void;
};

function SearchRouter({onRouterClose}: SearchRouterProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [recentSearches] = useOnyx(ONYXKEYS.RECENT_SEARCHES);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});

    const {isSmallScreenWidth} = useResponsiveLayout();
    const listRef = useRef<SelectionListHandle>(null);

    const taxRates = getAllTaxRates();
    const [cardList = {}] = useOnyx(ONYXKEYS.CARD_LIST);

    const [textInputValue, debouncedInputValue, setTextInputValue] = useDebouncedState('', 500);
    const [userSearchQuery, setUserSearchQuery] = useState<SearchQueryJSON | undefined>(undefined);
    const contextualReportID = useNavigationState<Record<string, {reportID: string}>, string | undefined>((state) => {
        return state?.routes.at(-1)?.params?.reportID;
    });
    const sortedRecentSearches = useMemo(() => {
        return Object.values(recentSearches ?? {}).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    }, [recentSearches]);

    const {options, areOptionsInitialized} = useOptionsList();
    const searchOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return {recentReports: [], personalDetails: [], userToInvite: null, currentUserOption: null, categoryOptions: [], tagOptions: [], taxRatesOptions: []};
        }
        return OptionsListUtils.getSearchOptions(options, '', betas ?? []);
    }, [areOptionsInitialized, betas, options]);

    /**
     * Builds a suffix tree and returns a function to search in it.
     */
    const findInSearchTree = useMemo(() => {
        const fastSearch = FastSearch.createFastSearch([
            {
                data: searchOptions.personalDetails,
                toSearchableString: (option) => {
                    const displayName = option.participantsList?.[0]?.displayName ?? '';
                    return [option.login ?? '', option.login !== displayName ? displayName : ''].join();
                },
            },
            {
                data: searchOptions.recentReports,
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
        function search(searchInput: string) {
            const [personalDetails, recentReports] = fastSearch.search(searchInput);

            return {
                personalDetails,
                recentReports,
            };
        }

        return search;
    }, [searchOptions.personalDetails, searchOptions.recentReports]);

    const filteredOptions = useMemo(() => {
        if (debouncedInputValue.trim() === '') {
            return {
                recentReports: [],
                personalDetails: [],
                userToInvite: null,
            };
        }

        Timing.start(CONST.TIMING.SEARCH_FILTER_OPTIONS);
        const newOptions = findInSearchTree(debouncedInputValue);
        Timing.end(CONST.TIMING.SEARCH_FILTER_OPTIONS);

        const recentReports = newOptions.recentReports.concat(newOptions.personalDetails);

        const userToInvite = OptionsListUtils.pickUserToInvite({
            canInviteUser: true,
            recentReports: newOptions.recentReports,
            personalDetails: newOptions.personalDetails,
            searchValue: debouncedInputValue,
            optionsToExclude: [{login: CONST.EMAIL.NOTIFICATIONS}],
        });

        return {
            recentReports,
            personalDetails: [],
            userToInvite,
        };
    }, [debouncedInputValue, findInSearchTree]);

    const recentReports: OptionData[] = useMemo(() => {
        if (debouncedInputValue === '') {
            return searchOptions.recentReports.slice(0, 10);
        }

        const reports: OptionData[] = [...filteredOptions.recentReports, ...filteredOptions.personalDetails];
        if (filteredOptions.userToInvite) {
            reports.push(filteredOptions.userToInvite);
        }
        return reports.slice(0, 10);
    }, [debouncedInputValue, filteredOptions, searchOptions]);

    useEffect(() => {
        Report.searchInServer(debouncedInputValue.trim());
    }, [debouncedInputValue]);

    const contextualReportData = contextualReportID ? searchOptions.recentReports?.find((option) => option.reportID === contextualReportID) : undefined;

    const clearUserQuery = () => {
        setTextInputValue('');
        setUserSearchQuery(undefined);
    };

    const onSearchChange = useMemo(
        // eslint-disable-next-line react-compiler/react-compiler
        () =>
            debounce((userQuery: string) => {
                if (!userQuery) {
                    clearUserQuery();
                    listRef.current?.updateAndScrollToFocusedIndex(-1);
                    return;
                }
                listRef.current?.updateAndScrollToFocusedIndex(0);
                const queryJSON = SearchUtils.buildSearchQueryJSON(userQuery);

                if (queryJSON) {
                    setUserSearchQuery(queryJSON);
                } else {
                    Log.alert(`${CONST.ERROR.ENSURE_BUGBOT} user query failed to parse`, userQuery, false);
                }
            }, SEARCH_DEBOUNCE_DELAY),
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const updateUserSearchQuery = (newSearchQuery: string) => {
        setTextInputValue(newSearchQuery);
        onSearchChange(newSearchQuery);
    };

    const closeAndClearRouter = useCallback(() => {
        onRouterClose();
        clearUserQuery();
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onRouterClose]);

    const onSearchSubmit = useCallback(
        (query: SearchQueryJSON | undefined) => {
            if (!query) {
                return;
            }
            onRouterClose();
            const standardizedQuery = SearchUtils.standardizeQueryJSON(query, cardList, taxRates);
            const queryString = SearchUtils.buildSearchQueryString(standardizedQuery);
            Navigation.navigate(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: queryString}));
            clearUserQuery();
        },
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [onRouterClose],
    );

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, () => {
        closeAndClearRouter();
    });

    const modalWidth = isSmallScreenWidth ? styles.w100 : {width: variables.searchRouterPopoverWidth};

    return (
        <View
            style={[styles.flex1, modalWidth, styles.h100, !isSmallScreenWidth && styles.mh85vh]}
            testID={SearchRouter.displayName}
        >
            {isSmallScreenWidth && (
                <HeaderWithBackButton
                    title={translate('common.search')}
                    onBackButtonPress={() => onRouterClose()}
                />
            )}
            <SearchRouterInput
                value={textInputValue}
                setValue={setTextInputValue}
                isFullWidth={isSmallScreenWidth}
                updateSearch={onSearchChange}
                onSubmit={() => {
                    onSearchSubmit(SearchUtils.buildSearchQueryJSON(textInputValue));
                }}
                routerListRef={listRef}
                shouldShowOfflineMessage
                wrapperStyle={[styles.border, styles.alignItemsCenter]}
                outerWrapperStyle={[isSmallScreenWidth ? styles.mv3 : styles.mv2, isSmallScreenWidth ? styles.mh5 : styles.mh2]}
                wrapperFocusedStyle={[styles.borderColorFocus]}
                isSearchingForReports={isSearchingForReports}
            />
            <SearchRouterList
                currentQuery={userSearchQuery}
                reportForContextualSearch={contextualReportData}
                recentSearches={sortedRecentSearches?.slice(0, 5)}
                recentReports={recentReports}
                onSearchSubmit={onSearchSubmit}
                updateUserSearchQuery={updateUserSearchQuery}
                closeAndClearRouter={closeAndClearRouter}
                ref={listRef}
            />
        </View>
    );
}

SearchRouter.displayName = 'SearchRouter';

export default SearchRouter;
