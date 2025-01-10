import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Animated, {clamp, measure, runOnUI, useAnimatedRef, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming} from 'react-native-reanimated';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import {usePersonalDetails} from '@components/OnyxProvider';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import {buildSubstitutionsMap} from '@components/Search/SearchRouter/buildSubstitutionsMap';
import {getQueryWithSubstitutions} from '@components/Search/SearchRouter/getQueryWithSubstitutions';
import type {SubstitutionMap} from '@components/Search/SearchRouter/getQueryWithSubstitutions';
import {getUpdatedSubstitutionsMap} from '@components/Search/SearchRouter/getUpdatedSubstitutionsMap';
import SearchRouterInput from '@components/Search/SearchRouter/SearchRouterInput';
import SearchRouterList from '@components/Search/SearchRouter/SearchRouterList';
import type {SearchQueryJSON, SearchQueryString} from '@components/Search/types';
import {isSearchQueryItem} from '@components/SelectionList/Search/SearchQueryListItem';
import type {SearchQueryItem} from '@components/SelectionList/Search/SearchQueryListItem';
import type {SelectionListHandle} from '@components/SelectionList/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchActions from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import * as SearchAutocompleteUtils from '@libs/SearchAutocompleteUtils';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import * as ReportUserActions from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

// When counting absolute positioning, we need to account for borders
const BORDER_WIDTH = 1;

type SearchPageHeaderInputNarrowProps = {
    queryJSON: SearchQueryJSON;
    narrowSearchRouterActive: boolean;
    activateNarrowSearchRouter: () => void;
    children: React.ReactNode;
};

function SearchPageHeaderInputNarrow({queryJSON, narrowSearchRouterActive, activateNarrowSearchRouter, children}: SearchPageHeaderInputNarrowProps) {
    const styles = useThemeStyles();
    const personalDetails = usePersonalDetails();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const taxRates = useMemo(() => getAllTaxRates(), []);

    const inputRowWidth = useSharedValue(0);
    const valueWasntZero = useSharedValue(false);
    const textInputWidth = useDerivedValue(() => {
        const newValue = narrowSearchRouterActive ? inputRowWidth.get() : inputRowWidth.get() - 52;
        if (!valueWasntZero.get()) {
            valueWasntZero.set(true);
            return narrowSearchRouterActive ? inputRowWidth.get() : inputRowWidth.get() - 52;
        }
        return newValue;
    }, [inputRowWidth, narrowSearchRouterActive]);
    const inputWrapperStyle = useAnimatedStyle(() => {
        return {
            width: textInputWidth.value,
        };
    }, [narrowSearchRouterActive, inputRowWidth]);
    const inputWrapperRef = useAnimatedRef<View>();

    const animatedPadding = useDerivedValue(() => {
        return withTiming(narrowSearchRouterActive ? 0 : 52, {duration: 300});
    }, [narrowSearchRouterActive]);
    const inputWrapperStyleTest = useAnimatedStyle(() => {
        return {
            paddingRight: animatedPadding.value,
        };
    });

    const {inputQuery: originalInputQuery} = queryJSON;
    const isCannedQuery = SearchQueryUtils.isCannedSearchQuery(queryJSON);
    const queryText = SearchQueryUtils.buildUserReadableQueryString(queryJSON, personalDetails, reports, taxRates);

    // The actual input text that the user sees
    const [textInputValue, setTextInputValue] = useState(isCannedQuery ? '' : queryText);
    // The input text that was last used for autocomplete; needed for the SearchRouterList when browsing list via arrow keys
    const [autocompleteQueryValue, setAutocompleteQueryValue] = useState(isCannedQuery ? '' : queryText);

    const [autocompleteSubstitutions, setAutocompleteSubstitutions] = useState<SubstitutionMap>({});
    const listRef = useRef<SelectionListHandle>(null);
    const textInputRef = useRef<AnimatedTextInputRef>(null);
    // const isFocused = useIsFocused();
    // const {registerSearchPageInput, unregisterSearchPageInput} = useSearchRouterContext();

    // // If query is non-canned that means Search Input is displayed, so we need to register its ref in the context.
    // useEffect(() => {
    //     if (!isFocused || !textInputRef.current) {
    //         return;
    //     }

    //     registerSearchPageInput(textInputRef.current);
    // }, [isCannedQuery, isFocused, registerSearchPageInput, unregisterSearchPageInput]);

    useEffect(() => {
        if (narrowSearchRouterActive || !textInputRef.current?.isFocused()) {
            return;
        }
        textInputRef.current?.blur();
    }, [narrowSearchRouterActive]);

    useEffect(() => {
        setTextInputValue(isCannedQuery ? '' : queryText);
    }, [isCannedQuery, queryText]);

    useEffect(() => {
        const substitutionsMap = buildSubstitutionsMap(originalInputQuery, personalDetails, reports, taxRates);
        setAutocompleteSubstitutions(substitutionsMap);
    }, [originalInputQuery, personalDetails, reports, taxRates]);

    const onSearchQueryChange = useCallback(
        (userQuery: string) => {
            const updatedUserQuery = SearchAutocompleteUtils.getAutocompleteQueryWithComma(textInputValue, userQuery);
            setTextInputValue(updatedUserQuery);
            setAutocompleteQueryValue(updatedUserQuery);

            const updatedSubstitutionsMap = getUpdatedSubstitutionsMap(userQuery, autocompleteSubstitutions);
            setAutocompleteSubstitutions(updatedSubstitutionsMap);

            if (updatedUserQuery || textInputValue.length > 0) {
                // listRef.current?.updateAndScrollToFocusedIndex(0);
            } else {
                listRef.current?.updateAndScrollToFocusedIndex(-1);
            }
        },
        [autocompleteSubstitutions, setTextInputValue, textInputValue],
    );

    const submitSearch = useCallback(
        (queryString: SearchQueryString) => {
            const queryWithSubstitutions = getQueryWithSubstitutions(queryString, autocompleteSubstitutions);
            const updatedQuery = SearchQueryUtils.getQueryWithUpdatedValues(queryWithSubstitutions, queryJSON.policyID);
            if (!updatedQuery) {
                return;
            }

            Navigation.navigate(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: updatedQuery}));

            if (updatedQuery !== originalInputQuery) {
                SearchActions.clearAllFilters();
                setTextInputValue('');
                setAutocompleteQueryValue('');
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
                    const trimmedUserSearchQuery = SearchAutocompleteUtils.getQueryWithoutAutocompletedPart(textInputValue);
                    onSearchQueryChange(`${trimmedUserSearchQuery}${SearchQueryUtils.sanitizeSearchValue(item.searchQuery)} `);

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
                ReportUserActions.navigateToAndOpenReport(item.login ? [item.login] : [], false);
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

    // const hideAutocompleteList = () => setIsAutocompleteListVisible(false);
    const showAutocompleteList = () => {
        // listRef.current?.updateAndScrollToFocusedIndex(0);
        activateNarrowSearchRouter();
    };

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
                    <Animated.View
                        style={[styles.flex1, {zIndex: 6}, inputWrapperStyleTest]}
                        ref={inputWrapperRef}
                    >
                        <SearchRouterInput
                            value={textInputValue}
                            onSearchQueryChange={onSearchQueryChange}
                            isFullWidth
                            onSubmit={() => {
                                submitSearch(textInputValue);
                            }}
                            autoFocus={false}
                            onFocus={showAutocompleteList}
                            // onBlur={hideAutocompleteList}
                            wrapperStyle={[styles.searchRouterInputResults, styles.br2]}
                            wrapperFocusedStyle={styles.searchRouterInputResultsFocused}
                            outerWrapperStyle={[]}
                            rightComponent={children}
                            routerListRef={listRef}
                            ref={textInputRef}
                        />
                    </Animated.View>
                    <View style={[styles.pAbsolute, {top: 6, right: 0}]}>
                        <Button
                            innerStyles={[styles.searchRouterInputResults, styles.borderNone]}
                            icon={Expensicons.Bookmark}
                            // onPress={onFiltersButtonPress}
                        />
                    </View>
                </View>
                {narrowSearchRouterActive && (
                    <View style={[styles.flex1]}>
                        <SearchRouterList
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

SearchPageHeaderInputNarrow.displayName = 'SearchPageHeaderInputNarrow';

export default SearchPageHeaderInputNarrow;
