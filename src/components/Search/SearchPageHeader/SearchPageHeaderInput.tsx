import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Animated, {useAnimatedStyle, useDerivedValue, useSharedValue, withTiming} from 'react-native-reanimated';
import * as Expensicons from '@components/Icon/Expensicons';
import {usePersonalDetails} from '@components/OnyxProvider';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import {buildSubstitutionsMap} from '@components/Search/SearchRouter/buildSubstitutionsMap';
import {getQueryWithSubstitutions} from '@components/Search/SearchRouter/getQueryWithSubstitutions';
import type {SubstitutionMap} from '@components/Search/SearchRouter/getQueryWithSubstitutions';
import {getUpdatedSubstitutionsMap} from '@components/Search/SearchRouter/getUpdatedSubstitutionsMap';
import {useSearchRouterContext} from '@components/Search/SearchRouter/SearchRouterContext';
import SearchRouterInput from '@components/Search/SearchRouter/SearchRouterInput';
import SearchRouterList from '@components/Search/SearchRouter/SearchRouterList';
import type {SearchQueryJSON, SearchQueryString} from '@components/Search/types';
import {isSearchQueryItem} from '@components/SelectionList/Search/SearchQueryListItem';
import type {SearchQueryItem} from '@components/SelectionList/Search/SearchQueryListItem';
import type {SelectionListHandle} from '@components/SelectionList/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateToAndOpenReport} from '@libs/actions/Report';
import {clearAllFilters} from '@libs/actions/Search';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import {getAutocompleteQueryWithComma, getQueryWithoutAutocompletedPart} from '@libs/SearchAutocompleteUtils';
import {buildUserReadableQueryString, getQueryWithUpdatedValues, isCannedSearchQuery, sanitizeSearchValue} from '@libs/SearchQueryUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SearchTypeMenuButton from './SearchTypeMenuButton';

// When counting absolute positioning, we need to account for borders
const BORDER_WIDTH = 1;

type SearchPageHeaderInputProps = {
    queryJSON: SearchQueryJSON;
    narrowSearchRouterActive?: boolean;
    activateNarrowSearchRouter?: () => void;
    children: React.ReactNode;
};

function SearchPageHeaderInput({queryJSON, narrowSearchRouterActive, activateNarrowSearchRouter, children}: SearchPageHeaderInputProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const personalDetails = usePersonalDetails();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const taxRates = useMemo(() => getAllTaxRates(), []);
    const [userCardList = {}] = useOnyx(ONYXKEYS.CARD_LIST);
    const [workspaceCardFeeds = {}] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
    const allCards = useMemo(() => mergeCardListWithWorkspaceFeeds(workspaceCardFeeds, userCardList), [userCardList, workspaceCardFeeds]);

    const {inputQuery: originalInputQuery} = queryJSON;
    const isCannedQuery = isCannedSearchQuery(queryJSON);
    const queryText = buildUserReadableQueryString(queryJSON, personalDetails, reports, taxRates, allCards);

    // The actual input text that the user sees
    const [textInputValue, setTextInputValue] = useState(isCannedQuery ? '' : queryText);
    // The input text that was last used for autocomplete; needed for the SearchRouterList when browsing list via arrow keys
    const [autocompleteQueryValue, setAutocompleteQueryValue] = useState(isCannedQuery ? '' : queryText);

    const [autocompleteSubstitutions, setAutocompleteSubstitutions] = useState<SubstitutionMap>({});
    const [isAutocompleteListVisible, setIsAutocompleteListVisible] = useState(false);
    const listRef = useRef<SelectionListHandle>(null);
    const textInputRef = useRef<AnimatedTextInputRef>(null);
    const isFocused = useIsFocused();
    const {registerSearchPageInput} = useSearchRouterContext();

    // useEffect for blurring TextInput when we cancel SearchRouter interaction on narrow layout
    useEffect(() => {
        if (!shouldUseNarrowLayout || !!narrowSearchRouterActive || !textInputRef.current || !textInputRef.current.isFocused()) {
            return;
        }
        textInputRef.current.blur();
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [narrowSearchRouterActive]);

    useEffect(() => {
        if (shouldUseNarrowLayout || !isFocused || !textInputRef.current) {
            return;
        }

        registerSearchPageInput(textInputRef.current);
    }, [isCannedQuery, isFocused, registerSearchPageInput, shouldUseNarrowLayout]);

    useEffect(() => {
        setTextInputValue(isCannedQuery ? '' : queryText);
        setAutocompleteQueryValue(isCannedQuery ? '' : queryText);
    }, [isCannedQuery, queryText]);

    useEffect(() => {
        const substitutionsMap = buildSubstitutionsMap(originalInputQuery, personalDetails, reports, taxRates, allCards);
        setAutocompleteSubstitutions(substitutionsMap);
    }, [allCards, originalInputQuery, personalDetails, reports, taxRates]);

    const onSearchQueryChange = useCallback(
        (userQuery: string) => {
            const updatedUserQuery = getAutocompleteQueryWithComma(textInputValue, userQuery);
            setTextInputValue(updatedUserQuery);
            setAutocompleteQueryValue(updatedUserQuery);

            const updatedSubstitutionsMap = getUpdatedSubstitutionsMap(userQuery, autocompleteSubstitutions);
            setAutocompleteSubstitutions(updatedSubstitutionsMap);

            if (updatedUserQuery || textInputValue.length > 0) {
                listRef.current?.updateAndScrollToFocusedIndex(0);
            } else {
                listRef.current?.updateAndScrollToFocusedIndex(-1);
            }
        },
        [autocompleteSubstitutions, setTextInputValue, textInputValue],
    );

    const submitSearch = useCallback(
        (queryString: SearchQueryString) => {
            const queryWithSubstitutions = getQueryWithSubstitutions(queryString, autocompleteSubstitutions);
            const updatedQuery = getQueryWithUpdatedValues(queryWithSubstitutions, queryJSON.policyID);
            if (!updatedQuery) {
                return;
            }

            Navigation.navigate(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: updatedQuery}));

            if (updatedQuery !== originalInputQuery) {
                clearAllFilters();
                setTextInputValue('');
                setAutocompleteQueryValue('');
                setIsAutocompleteListVisible(false);
            }
        },
        [autocompleteSubstitutions, originalInputQuery, queryJSON.policyID],
    );

    const onListItemPress = useCallback(
        (item: OptionData | SearchQueryItem) => {
            if (isSearchQueryItem(item)) {
                if (!item.searchQuery) {
                    return;
                }

                if (item.searchItemType === CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.AUTOCOMPLETE_SUGGESTION && textInputValue) {
                    const trimmedUserSearchQuery = getQueryWithoutAutocompletedPart(textInputValue);
                    onSearchQueryChange(`${trimmedUserSearchQuery}${sanitizeSearchValue(item.searchQuery)} `);

                    if (item.mapKey && item.autocompleteID) {
                        const substitutions = {...autocompleteSubstitutions, [item.mapKey]: item.autocompleteID};

                        setAutocompleteSubstitutions(substitutions);
                    }
                } else if (item.searchItemType === CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.SEARCH) {
                    submitSearch(item.searchQuery);
                }
            } else if (item?.reportID) {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(item?.reportID));
            } else if ('login' in item) {
                navigateToAndOpenReport(item.login ? [item.login] : [], false);
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

    const inputRowWidth = useSharedValue(0);
    const animatedPadding = useDerivedValue(() => {
        return withTiming(narrowSearchRouterActive ? 0 : 52, {duration: 300});
    }, [narrowSearchRouterActive]);
    const inputWrapperStyleTest = useAnimatedStyle(() => {
        return {
            marginRight: animatedPadding.value,
        };
    });

    if (shouldUseNarrowLayout) {
        return (
            <View
                dataSet={{dragArea: false}}
                style={[styles.flex1]}
            >
                <View style={[styles.appBG, styles.flex1]}>
                    <View
                        style={[styles.flexRow, styles.mh5, styles.mb3, styles.alignItemsCenter, styles.justifyContentCenter, {height: 52}]}
                        onLayout={(event) => {
                            inputRowWidth.set(event.nativeEvent.layout.width);
                        }}
                    >
                        <Animated.View style={[styles.flex1, styles.zIndex10, inputWrapperStyleTest]}>
                            <SearchRouterInput
                                value={textInputValue}
                                onSearchQueryChange={onSearchQueryChange}
                                isFullWidth
                                onSubmit={() => {
                                    submitSearch(textInputValue);
                                }}
                                autoFocus={false}
                                onFocus={() => {
                                    listRef.current?.updateAndScrollToFocusedIndex(0);
                                    activateNarrowSearchRouter?.();
                                }}
                                wrapperStyle={[styles.searchRouterInputResults, styles.br2]}
                                rightComponent={children}
                                routerListRef={listRef}
                                ref={textInputRef}
                            />
                        </Animated.View>
                        <View style={[styles.pAbsolute, {right: 0}]}>
                            <SearchTypeMenuButton queryJSON={queryJSON} />
                        </View>
                    </View>
                    <View style={[styles.flex1, !narrowSearchRouterActive && styles.dNone]}>
                        <SearchRouterList
                            autocompleteQueryValue={autocompleteQueryValue}
                            searchQueryItem={searchQueryItem}
                            onListItemPress={onListItemPress}
                            setTextQuery={setTextInputValue}
                            updateAutocompleteSubstitutions={updateAutocompleteSubstitutions}
                            ref={listRef}
                        />
                    </View>
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
    const popoverHorizontalPosition = 12 - BORDER_WIDTH;
    const autocompleteInputStyle = isAutocompleteListVisible
        ? [
              styles.border,
              styles.borderRadiusComponentLarge,
              styles.pAbsolute,
              styles.pt2,
              {top: 8 - BORDER_WIDTH, left: popoverHorizontalPosition, right: popoverHorizontalPosition},
              {boxShadow: variables.popoverMenuShadow},
          ]
        : [styles.pt4];
    const inputWrapperActiveStyle = isAutocompleteListVisible ? styles.ph2 : null;

    return (
        <View
            dataSet={{dragArea: false}}
            style={[styles.searchResultsHeaderBar, isAutocompleteListVisible && styles.ph3]}
        >
            <View style={[styles.appBG, ...autocompleteInputStyle]}>
                <SearchRouterInput
                    value={textInputValue}
                    onSearchQueryChange={onSearchQueryChange}
                    isFullWidth
                    onSubmit={() => {
                        submitSearch(textInputValue);
                    }}
                    autoFocus={false}
                    onFocus={showAutocompleteList}
                    onBlur={hideAutocompleteList}
                    wrapperStyle={[styles.searchRouterInputResults, styles.br2]}
                    outerWrapperStyle={[inputWrapperActiveStyle, styles.pb2]}
                    rightComponent={children}
                    routerListRef={listRef}
                    ref={textInputRef}
                />
                <View style={[styles.mh85vh, !isAutocompleteListVisible && styles.dNone]}>
                    <SearchRouterList
                        autocompleteQueryValue={autocompleteQueryValue}
                        searchQueryItem={searchQueryItem}
                        onListItemPress={onListItemPress}
                        setTextQuery={setTextInputValue}
                        updateAutocompleteSubstitutions={updateAutocompleteSubstitutions}
                        ref={listRef}
                    />
                </View>
            </View>
        </View>
    );
}

SearchPageHeaderInput.displayName = 'SearchPageHeaderInput';

export default SearchPageHeaderInput;
