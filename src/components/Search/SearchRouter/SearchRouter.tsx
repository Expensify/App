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
import Log from '@libs/Log';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import * as SearchUtils from '@libs/SearchUtils';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {useSearchRouterContext} from './SearchRouterContext';
import SearchRouterInput from './SearchRouterInput';
import SearchRouterList from './SearchRouterList';

const SEARCH_DEBOUNCE_DELAY = 150;

function SearchRouter() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [recentSearches] = useOnyx(ONYXKEYS.RECENT_SEARCHES);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});

    const {isSmallScreenWidth} = useResponsiveLayout();
    const {isSearchRouterDisplayed, closeSearchRouter} = useSearchRouterContext();
    const listRef = useRef<SelectionListHandle>(null);

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

    const filteredOptions = useMemo(() => {
        if (debouncedInputValue.trim() === '') {
            return {
                recentReports: [],
                personalDetails: [],
                userToInvite: null,
            };
        }

        const newOptions = OptionsListUtils.filterOptions(searchOptions, debouncedInputValue, {sortByReportTypeInSearch: true, preferChatroomsOverThreads: true});

        return {
            recentReports: newOptions.recentReports,
            personalDetails: newOptions.personalDetails,
            userToInvite: newOptions.userToInvite,
        };
    }, [debouncedInputValue, searchOptions]);

    const recentReports: OptionData[] = useMemo(() => {
        const currentSearchOptions = debouncedInputValue === '' ? searchOptions : filteredOptions;
        const reports: OptionData[] = [...currentSearchOptions.recentReports, ...currentSearchOptions.personalDetails];
        if (currentSearchOptions.userToInvite) {
            reports.push(currentSearchOptions.userToInvite);
        }
        return reports.slice(0, 10);
    }, [debouncedInputValue, filteredOptions, searchOptions]);

    useEffect(() => {
        Report.searchInServer(debouncedInputValue.trim());
    }, [debouncedInputValue]);

    useEffect(() => {
        if (!textInputValue && isSearchRouterDisplayed) {
            return;
        }
        listRef.current?.updateAndScrollToFocusedIndex(0);
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSearchRouterDisplayed]);

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
        closeSearchRouter();
        clearUserQuery();
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [closeSearchRouter]);

    const onSearchSubmit = useCallback(
        (query: SearchQueryJSON | undefined) => {
            if (!query) {
                return;
            }
            closeSearchRouter();
            const queryString = SearchUtils.buildSearchQueryString(query);
            Navigation.navigate(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: queryString}));
            clearUserQuery();
        },
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [closeSearchRouter],
    );

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, () => {
        closeSearchRouter();
        clearUserQuery();
    });

    const modalWidth = isSmallScreenWidth ? styles.w100 : {width: variables.popoverWidth};

    return (
        <View style={[styles.flex1, modalWidth, styles.h100, !isSmallScreenWidth && styles.mh85vh]}>
            {isSmallScreenWidth && (
                <HeaderWithBackButton
                    title={translate('common.search')}
                    onBackButtonPress={() => closeSearchRouter()}
                />
            )}
            <SearchRouterInput
                value={textInputValue}
                setValue={setTextInputValue}
                isFullWidth={isSmallScreenWidth}
                updateSearch={onSearchChange}
                routerListRef={listRef}
                wrapperStyle={[isSmallScreenWidth ? styles.mv3 : styles.mv2, isSmallScreenWidth ? styles.mh5 : styles.mh2, styles.border]}
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
