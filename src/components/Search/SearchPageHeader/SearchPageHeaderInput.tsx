import {useIsFocused} from '@react-navigation/native';
import {deepEqual} from 'fast-equals';
import isEmpty from 'lodash/isEmpty';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import Animated, {FadeInRight, FadeOutRight} from 'react-native-reanimated';
import * as Expensicons from '@components/Icon/Expensicons';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import SearchAutocompleteList from '@components/Search/SearchAutocompleteList';
import SearchInputSelectionWrapper from '@components/Search/SearchInputSelectionWrapper';
import {buildSubstitutionsMap} from '@components/Search/SearchRouter/buildSubstitutionsMap';
import type {SubstitutionMap} from '@components/Search/SearchRouter/getQueryWithSubstitutions';
import {getQueryWithSubstitutions} from '@components/Search/SearchRouter/getQueryWithSubstitutions';
import {getUpdatedSubstitutionsMap} from '@components/Search/SearchRouter/getUpdatedSubstitutionsMap';
import {useSearchRouterContext} from '@components/Search/SearchRouter/SearchRouterContext';
import type {SearchQueryJSON, SearchQueryString} from '@components/Search/types';
import type {SearchQueryItem} from '@components/SelectionList/Search/SearchQueryListItem';
import {isSearchQueryItem} from '@components/SelectionList/Search/SearchQueryListItem';
import type {SelectionListHandle} from '@components/SelectionList/types';
import HelpButton from '@components/SidePanel/HelpComponents/HelpButton';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateToAndOpenReport} from '@libs/actions/Report';
import {clearAllFilters} from '@libs/actions/Search';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import {getAutocompleteQueryWithComma, getQueryWithoutAutocompletedPart} from '@libs/SearchAutocompleteUtils';
import {buildUserReadableQueryString, getQueryWithUpdatedValues, isDefaultExpensesQuery, sanitizeSearchValue} from '@libs/SearchQueryUtils';
import StringUtils from '@libs/StringUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import KeyboardUtils from '@src/utils/keyboard';
import SearchTypeMenuPopover from './SearchTypeMenuPopover';

// When counting absolute positioning, we need to account for borders
const BORDER_WIDTH = 1;

type SearchPageHeaderInputProps = {
    queryJSON: SearchQueryJSON;
    searchRouterListVisible?: boolean;
    hideSearchRouterList?: () => void;
    onSearchRouterFocus?: () => void;
    handleSearch: (value: string) => void;
};

function SearchPageHeaderInput({queryJSON, searchRouterListVisible, hideSearchRouterList, onSearchRouterFocus, handleSearch}: SearchPageHeaderInputProps) {
    const [showPopupButton, setShowPopupButton] = useState(true);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {shouldUseNarrowLayout: displayNarrowHeader} = useResponsiveLayout();
    const personalDetails = usePersonalDetails();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const taxRates = useMemo(() => getAllTaxRates(), []);
    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});
    const allCards = useMemo(() => mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, userCardList), [userCardList, workspaceCardFeeds]);
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER, {canBeMissing: true});
    const {inputQuery: originalInputQuery} = queryJSON;
    const isDefaultQuery = isDefaultExpensesQuery(queryJSON);
    const [shouldUseAnimation, setShouldUseAnimation] = useState(false);
    const queryText = buildUserReadableQueryString(queryJSON, personalDetails, reports, taxRates, allCards, allFeeds, policies);

    // The actual input text that the user sees
    const [textInputValue, setTextInputValue] = useState(isDefaultQuery ? '' : queryText);
    // The input text that was last used for autocomplete; needed for the SearchAutocompleteList when browsing list via arrow keys
    const [autocompleteQueryValue, setAutocompleteQueryValue] = useState(isDefaultQuery ? '' : queryText);
    const [selection, setSelection] = useState({start: textInputValue.length, end: textInputValue.length});

    const [autocompleteSubstitutions, setAutocompleteSubstitutions] = useState<SubstitutionMap>({});
    const [isAutocompleteListVisible, setIsAutocompleteListVisible] = useState(false);
    const listRef = useRef<SelectionListHandle>(null);
    const textInputRef = useRef<AnimatedTextInputRef>(null);
    const hasMountedRef = useRef(false);
    const isFocused = useIsFocused();
    const {registerSearchPageInput} = useSearchRouterContext();

    useEffect(() => {
        hasMountedRef.current = true;
    }, []);

    // useEffect for blurring TextInput when we cancel SearchRouter interaction on narrow layout
    useEffect(() => {
        if (!displayNarrowHeader || !!searchRouterListVisible || !textInputRef.current || !textInputRef.current.isFocused()) {
            return;
        }
        textInputRef.current.blur();
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchRouterListVisible]);

    useEffect(() => {
        if (displayNarrowHeader || !isFocused || !textInputRef.current) {
            return;
        }

        registerSearchPageInput(textInputRef.current);
    }, [isFocused, registerSearchPageInput, displayNarrowHeader]);

    useEffect(() => {
        setTextInputValue(isDefaultQuery ? '' : queryText);
        setAutocompleteQueryValue(isDefaultQuery ? '' : queryText);
    }, [isDefaultQuery, queryText]);

    useEffect(() => {
        const substitutionsMap = buildSubstitutionsMap(originalInputQuery, personalDetails, reports, taxRates, allCards, allFeeds, policies);
        setAutocompleteSubstitutions(substitutionsMap);
    }, [allFeeds, allCards, originalInputQuery, personalDetails, reports, taxRates, policies]);

    useEffect(() => {
        if (searchRouterListVisible) {
            return;
        }
        setShowPopupButton(true);
        setShouldUseAnimation(true);
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchRouterListVisible]);

    const onFocus = useCallback(() => {
        onSearchRouterFocus?.();
        listRef.current?.updateAndScrollToFocusedIndex(0);
        setShowPopupButton(false);
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearchAction = useCallback(
        (value: string) => {
            // Skip calling handleSearch on the initial mount
            if (!hasMountedRef.current) {
                return;
            }
            handleSearch(value);
        },
        [handleSearch],
    );
    const onSearchQueryChange = useCallback(
        (userQuery: string) => {
            const actionId = `page_search_query_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            const startTime = Date.now();

            Log.info('[CMD_K_DEBUG] Page search query change started', false, {
                actionId,
                inputLength: userQuery.length,
                previousInputLength: textInputValue.length,
                timestamp: startTime,
            });

            try {
                const singleLineUserQuery = StringUtils.lineBreaksToSpaces(userQuery, true);
                const updatedUserQuery = getAutocompleteQueryWithComma(textInputValue, singleLineUserQuery);
                setTextInputValue(updatedUserQuery);
                setAutocompleteQueryValue(updatedUserQuery);

                const updatedSubstitutionsMap = getUpdatedSubstitutionsMap(singleLineUserQuery, autocompleteSubstitutions);
                if (!deepEqual(autocompleteSubstitutions, updatedSubstitutionsMap) && !isEmpty(updatedSubstitutionsMap)) {
                    setAutocompleteSubstitutions(updatedSubstitutionsMap);
                }

                if (updatedUserQuery) {
                    listRef.current?.updateAndScrollToFocusedIndex(0);
                } else {
                    listRef.current?.updateAndScrollToFocusedIndex(-1);
                }

                const endTime = Date.now();
                Log.info('[CMD_K_DEBUG] Page search query change completed', false, {
                    actionId,
                    duration: endTime - startTime,
                    finalInputLength: updatedUserQuery.length,
                    substitutionsUpdated: !deepEqual(autocompleteSubstitutions, updatedSubstitutionsMap) && !isEmpty(updatedSubstitutionsMap),
                    timestamp: endTime,
                });
            } catch (error) {
                const endTime = Date.now();
                Log.alert('[CMD_K_FREEZE] Page search query change failed', {
                    actionId,
                    error: String(error),
                    duration: endTime - startTime,
                    inputLength: userQuery.length,
                    timestamp: endTime,
                });
                throw error;
            }
        },
        [autocompleteSubstitutions, setTextInputValue, textInputValue],
    );

    const submitSearch = useCallback(
        (queryString: SearchQueryString) => {
            const queryWithSubstitutions = getQueryWithSubstitutions(queryString, autocompleteSubstitutions);
            const updatedQuery = getQueryWithUpdatedValues(queryWithSubstitutions);

            if (!updatedQuery) {
                return;
            }

            Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: updatedQuery}));
            hideSearchRouterList?.();
            setIsAutocompleteListVisible(false);
            if (updatedQuery !== originalInputQuery) {
                clearAllFilters();
                setTextInputValue('');
                setAutocompleteQueryValue('');
            }
        },
        [autocompleteSubstitutions, hideSearchRouterList, originalInputQuery],
    );

    const onListItemPress = useCallback(
        (item: OptionData | SearchQueryItem) => {
            const actionId = `page_list_item_press_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            const startTime = Date.now();

            Log.info('[CMD_K_DEBUG] Page list item press started', false, {
                actionId,
                itemType: isSearchQueryItem(item) ? 'SearchQueryItem' : 'OptionData',
                searchItemType: isSearchQueryItem(item) ? item.searchItemType : undefined,
                hasSearchQuery: isSearchQueryItem(item) ? !!item.searchQuery : undefined,
                hasReportID: 'reportID' in item ? !!item.reportID : undefined,
                hasLogin: 'login' in item ? !!item.login : undefined,
                timestamp: startTime,
            });

            try {
                if (isSearchQueryItem(item)) {
                    if (!item.searchQuery) {
                        Log.info('[CMD_K_DEBUG] Page list item press skipped - no search query', false, {
                            actionId,
                            itemType: 'SearchQueryItem',
                            timestamp: Date.now(),
                        });
                        return;
                    }

                    if (item.searchItemType === CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.AUTOCOMPLETE_SUGGESTION && textInputValue) {
                        const trimmedUserSearchQuery = getQueryWithoutAutocompletedPart(textInputValue);
                        const newSearchQuery = `${trimmedUserSearchQuery}${sanitizeSearchValue(item.searchQuery)}\u00A0`;
                        onSearchQueryChange(newSearchQuery);
                        setSelection({start: newSearchQuery.length, end: newSearchQuery.length});

                        if (item.mapKey && item.autocompleteID) {
                            const substitutions = {...autocompleteSubstitutions, [item.mapKey]: item.autocompleteID};
                            setAutocompleteSubstitutions(substitutions);
                        }

                        const endTime = Date.now();
                        Log.info('[CMD_K_DEBUG] Page autocomplete suggestion handled', false, {
                            actionId,
                            duration: endTime - startTime,
                            trimmedQueryLength: trimmedUserSearchQuery.length,
                            newQueryLength: newSearchQuery.length,
                            hasMapKey: !!(item.mapKey && item.autocompleteID),
                            timestamp: endTime,
                        });
                    } else if (item.searchItemType === CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.SEARCH) {
                        submitSearch(item.searchQuery);

                        const endTime = Date.now();
                        Log.info('[CMD_K_DEBUG] Page search submitted', false, {
                            actionId,
                            duration: endTime - startTime,
                            searchQuery: item.searchQuery,
                            timestamp: endTime,
                        });
                    }
                } else if (item?.reportID) {
                    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(item?.reportID));

                    const endTime = Date.now();
                    Log.info('[CMD_K_DEBUG] Page report navigation handled', false, {
                        actionId,
                        duration: endTime - startTime,
                        reportID: item.reportID,
                        timestamp: endTime,
                    });
                } else if ('login' in item) {
                    navigateToAndOpenReport(item.login ? [item.login] : [], false);

                    const endTime = Date.now();
                    Log.info('[CMD_K_DEBUG] Page user navigation handled', false, {
                        actionId,
                        duration: endTime - startTime,
                        hasLogin: !!item.login,
                        timestamp: endTime,
                    });
                }
            } catch (error) {
                const endTime = Date.now();
                Log.alert('[CMD_K_FREEZE] Page list item press failed', {
                    actionId,
                    error: String(error),
                    duration: endTime - startTime,
                    itemType: isSearchQueryItem(item) ? 'SearchQueryItem' : 'OptionData',
                    searchItemType: isSearchQueryItem(item) ? item.searchItemType : undefined,
                    timestamp: endTime,
                });
                throw error;
            }
        },
        [autocompleteSubstitutions, onSearchQueryChange, submitSearch, textInputValue],
    );

    const updateAutocompleteSubstitutions = useCallback(
        (item: SearchQueryItem) => {
            if (!item.autocompleteID || !item.mapKey) {
                return;
            }

            const substitutions = {...autocompleteSubstitutions, [item.mapKey]: item.autocompleteID};
            setAutocompleteSubstitutions(substitutions);
        },
        [autocompleteSubstitutions],
    );

    const setTextAndUpdateSelection = useCallback(
        (text: string) => {
            setTextInputValue(text);
            setSelection({start: text.length, end: text.length});
        },
        [setSelection, setTextInputValue],
    );

    const searchQueryItem = textInputValue
        ? {
              text: textInputValue,
              singleIcon: Expensicons.MagnifyingGlass,
              searchQuery: textInputValue,
              itemStyle: styles.activeComponentBG,
              keyForList: 'findItem',
              searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.SEARCH,
          }
        : undefined;

    if (displayNarrowHeader) {
        return (
            <View
                dataSet={{dragArea: false}}
                style={[styles.flex1]}
            >
                <View style={[styles.appBG, styles.flex1]}>
                    <View style={[styles.flexRow, styles.mh5, styles.mb3, styles.alignItemsCenter, styles.justifyContentCenter, {height: variables.searchTopBarHeight}]}>
                        <Animated.View style={[styles.flex1, styles.zIndex10]}>
                            <SearchInputSelectionWrapper
                                value={textInputValue}
                                substitutionMap={autocompleteSubstitutions}
                                selection={selection}
                                onSearchQueryChange={onSearchQueryChange}
                                isFullWidth
                                onSubmit={() => {
                                    KeyboardUtils.dismiss().then(() => submitSearch(textInputValue));
                                }}
                                autoFocus={false}
                                onFocus={onFocus}
                                wrapperStyle={{...styles.searchAutocompleteInputResults, ...styles.br2}}
                                wrapperFocusedStyle={styles.searchAutocompleteInputResultsFocused}
                                autocompleteListRef={listRef}
                                ref={textInputRef}
                            />
                        </Animated.View>
                        {showPopupButton && (
                            <Animated.View
                                entering={shouldUseAnimation ? FadeInRight : undefined}
                                exiting={isFocused && searchRouterListVisible ? FadeOutRight : undefined}
                                style={[styles.pl3]}
                            >
                                <SearchTypeMenuPopover queryJSON={queryJSON} />
                            </Animated.View>
                        )}
                    </View>
                    {!!searchRouterListVisible && (
                        <View style={[styles.flex1]}>
                            <SearchAutocompleteList
                                autocompleteQueryValue={autocompleteQueryValue}
                                handleSearch={handleSearchAction}
                                searchQueryItem={searchQueryItem}
                                onListItemPress={onListItemPress}
                                setTextQuery={setTextAndUpdateSelection}
                                updateAutocompleteSubstitutions={updateAutocompleteSubstitutions}
                                ref={listRef}
                                personalDetails={personalDetails}
                                reports={reports}
                                allCards={allCards}
                                allFeeds={allFeeds}
                            />
                        </View>
                    )}
                </View>
            </View>
        );
    }

    const hideAutocompleteList = () => setIsAutocompleteListVisible(false);
    const showAutocompleteList = () => {
        listRef.current?.updateAndScrollToFocusedIndex(0);
        setIsAutocompleteListVisible(true);
    };
    // we need `- BORDER_WIDTH` to achieve the effect that the input will not "jump"
    const leftPopoverHorizontalPosition = 12 - BORDER_WIDTH;
    const rightPopoverHorizontalPosition = 4 - BORDER_WIDTH;
    const autocompleteInputStyle = isAutocompleteListVisible
        ? [
              styles.border,
              styles.borderRadiusComponentLarge,
              styles.pAbsolute,
              styles.pt2,
              {top: 8 - BORDER_WIDTH, left: leftPopoverHorizontalPosition, right: rightPopoverHorizontalPosition},
              {boxShadow: theme.shadow},
          ]
        : [styles.pt4];
    const inputWrapperActiveStyle = isAutocompleteListVisible ? styles.ph2 : null;

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.zIndex10, styles.mr3]}>
            <View
                dataSet={{dragArea: false}}
                style={[styles.searchResultsHeaderBar, styles.flex1, isAutocompleteListVisible && styles.pr1, isAutocompleteListVisible && styles.pl3]}
            >
                <View style={[styles.appBG, ...autocompleteInputStyle]}>
                    <SearchInputSelectionWrapper
                        value={textInputValue}
                        onSearchQueryChange={onSearchQueryChange}
                        isFullWidth
                        onSubmit={() => {
                            const focusedOption = listRef.current?.getFocusedOption();
                            if (focusedOption) {
                                return;
                            }
                            submitSearch(textInputValue);
                        }}
                        autoFocus={false}
                        onFocus={showAutocompleteList}
                        onBlur={hideAutocompleteList}
                        wrapperStyle={{...styles.searchAutocompleteInputResults, ...styles.br2}}
                        wrapperFocusedStyle={styles.searchAutocompleteInputResultsFocused}
                        outerWrapperStyle={[inputWrapperActiveStyle, styles.pb2]}
                        autocompleteListRef={listRef}
                        ref={textInputRef}
                        selection={selection}
                        substitutionMap={autocompleteSubstitutions}
                    />
                    <View style={[styles.mh65vh, !isAutocompleteListVisible && styles.dNone]}>
                        <SearchAutocompleteList
                            autocompleteQueryValue={autocompleteQueryValue}
                            handleSearch={handleSearchAction}
                            searchQueryItem={searchQueryItem}
                            onListItemPress={onListItemPress}
                            setTextQuery={setTextAndUpdateSelection}
                            updateAutocompleteSubstitutions={updateAutocompleteSubstitutions}
                            ref={listRef}
                            shouldSubscribeToArrowKeyEvents={isAutocompleteListVisible}
                            personalDetails={personalDetails}
                            reports={reports}
                            allCards={allCards}
                            allFeeds={allFeeds}
                        />
                    </View>
                </View>
            </View>
            <HelpButton style={[styles.mt1Half]} />
        </View>
    );
}

SearchPageHeaderInput.displayName = 'SearchPageHeaderInput';

export default SearchPageHeaderInput;
