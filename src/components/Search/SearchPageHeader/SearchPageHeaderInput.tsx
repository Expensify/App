import {useIsFocused} from '@react-navigation/native';
import isEqual from 'lodash/isEqual';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Animated, {FadeInRight, FadeOutRight} from 'react-native-reanimated';
import * as Expensicons from '@components/Icon/Expensicons';
import {usePersonalDetails} from '@components/OnyxProvider';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import SearchAutocompleteList from '@components/Search/SearchAutocompleteList';
import SearchInputSelectionWrapper from '@components/Search/SearchInputSelectionWrapper';
import {buildSubstitutionsMap} from '@components/Search/SearchRouter/buildSubstitutionsMap';
import {getQueryWithSubstitutions} from '@components/Search/SearchRouter/getQueryWithSubstitutions';
import type {SubstitutionMap} from '@components/Search/SearchRouter/getQueryWithSubstitutions';
import {getUpdatedSubstitutionsMap} from '@components/Search/SearchRouter/getUpdatedSubstitutionsMap';
import {useSearchRouterContext} from '@components/Search/SearchRouter/SearchRouterContext';
import type {SearchQueryJSON, SearchQueryString} from '@components/Search/types';
import {isSearchQueryItem} from '@components/SelectionList/Search/SearchQueryListItem';
import type {SearchQueryItem} from '@components/SelectionList/Search/SearchQueryListItem';
import type {SelectionListHandle} from '@components/SelectionList/types';
import HelpButton from '@components/SidePane/HelpButton';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateToAndOpenReport} from '@libs/actions/Report';
import {clearAllFilters} from '@libs/actions/Search';
import {getCardFeedNamesWithType} from '@libs/CardFeedUtils';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
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
    searchName?: string;
    inputRightComponent: React.ReactNode;
};

function SearchPageHeaderInput({queryJSON, searchRouterListVisible, hideSearchRouterList, onSearchRouterFocus, searchName, inputRightComponent}: SearchPageHeaderInputProps) {
    const {translate} = useLocalize();
    const [showPopupButton, setShowPopupButton] = useState(true);
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout: displayNarrowHeader} = useResponsiveLayout();
    const personalDetails = usePersonalDetails();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const taxRates = useMemo(() => getAllTaxRates(), []);
    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
    const allCards = useMemo(() => mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, userCardList), [userCardList, workspaceCardFeeds]);
    const cardFeedNamesWithType = useMemo(() => {
        return getCardFeedNamesWithType({workspaceCardFeeds, userCardList, translate});
    }, [translate, workspaceCardFeeds, userCardList]);
    const {inputQuery: originalInputQuery} = queryJSON;
    const isDefaultQuery = isDefaultExpensesQuery(queryJSON);
    const [shouldUseAnimation, setShouldUseAnimation] = useState(false);
    const queryText = buildUserReadableQueryString(queryJSON, personalDetails, reports, taxRates, allCards, cardFeedNamesWithType);

    // The actual input text that the user sees
    const [textInputValue, setTextInputValue] = useState(isDefaultQuery ? '' : queryText);
    // The input text that was last used for autocomplete; needed for the SearchAutocompleteList when browsing list via arrow keys
    const [autocompleteQueryValue, setAutocompleteQueryValue] = useState(isDefaultQuery ? '' : queryText);
    const [selection, setSelection] = useState({start: textInputValue.length, end: textInputValue.length});

    const [autocompleteSubstitutions, setAutocompleteSubstitutions] = useState<SubstitutionMap>({});
    const [isAutocompleteListVisible, setIsAutocompleteListVisible] = useState(false);
    const listRef = useRef<SelectionListHandle>(null);
    const textInputRef = useRef<AnimatedTextInputRef>(null);
    const isFocused = useIsFocused();
    const {registerSearchPageInput} = useSearchRouterContext();

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
        const substitutionsMap = buildSubstitutionsMap(originalInputQuery, personalDetails, reports, taxRates, allCards, cardFeedNamesWithType);
        setAutocompleteSubstitutions(substitutionsMap);
    }, [cardFeedNamesWithType, allCards, originalInputQuery, personalDetails, reports, taxRates]);

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

    const onSearchQueryChange = useCallback(
        (userQuery: string) => {
            const singleLineUserQuery = StringUtils.lineBreaksToSpaces(userQuery, true);
            const updatedUserQuery = getAutocompleteQueryWithComma(textInputValue, singleLineUserQuery);
            setTextInputValue(updatedUserQuery);
            setAutocompleteQueryValue(updatedUserQuery);

            const updatedSubstitutionsMap = getUpdatedSubstitutionsMap(singleLineUserQuery, autocompleteSubstitutions);
            if (!isEqual(autocompleteSubstitutions, updatedSubstitutionsMap)) {
                setAutocompleteSubstitutions(updatedSubstitutionsMap);
            }

            if (updatedUserQuery) {
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

            Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: updatedQuery}));
            hideSearchRouterList?.();
            setIsAutocompleteListVisible(false);
            if (updatedQuery !== originalInputQuery) {
                clearAllFilters();
                setTextInputValue('');
                setAutocompleteQueryValue('');
            }
        },
        [autocompleteSubstitutions, hideSearchRouterList, originalInputQuery, queryJSON.policyID],
    );

    const onListItemPress = useCallback(
        (item: OptionData | SearchQueryItem) => {
            if (isSearchQueryItem(item)) {
                if (!item.searchQuery) {
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
                                onSearchQueryChange={onSearchQueryChange}
                                isFullWidth
                                onSubmit={() => {
                                    KeyboardUtils.dismiss().then(() => submitSearch(textInputValue));
                                }}
                                autoFocus={false}
                                onFocus={onFocus}
                                wrapperStyle={{...styles.searchAutocompleteInputResults, ...styles.br2}}
                                wrapperFocusedStyle={styles.searchAutocompleteInputResultsFocused}
                                rightComponent={inputRightComponent}
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
                                <SearchTypeMenuPopover
                                    queryJSON={queryJSON}
                                    searchName={searchName}
                                />
                            </Animated.View>
                        )}
                    </View>
                    {!!searchRouterListVisible && (
                        <View style={[styles.flex1]}>
                            <SearchAutocompleteList
                                autocompleteQueryValue={autocompleteQueryValue}
                                searchQueryItem={searchQueryItem}
                                onListItemPress={onListItemPress}
                                setTextQuery={setTextInputValue}
                                updateAutocompleteSubstitutions={updateAutocompleteSubstitutions}
                                ref={listRef}
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
              {boxShadow: variables.popoverMenuShadow},
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
                        rightComponent={inputRightComponent}
                        autocompleteListRef={listRef}
                        ref={textInputRef}
                        selection={selection}
                        substitutionMap={autocompleteSubstitutions}
                    />
                    <View style={[styles.mh65vh, !isAutocompleteListVisible && styles.dNone]}>
                        <SearchAutocompleteList
                            autocompleteQueryValue={autocompleteQueryValue}
                            searchQueryItem={searchQueryItem}
                            onListItemPress={onListItemPress}
                            setTextQuery={setTextAndUpdateSelection}
                            updateAutocompleteSubstitutions={updateAutocompleteSubstitutions}
                            ref={listRef}
                            shouldSubscribeToArrowKeyEvents={isAutocompleteListVisible}
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
