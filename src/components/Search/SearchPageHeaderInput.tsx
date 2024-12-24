import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Header from '@components/Header';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import {usePersonalDetails} from '@components/OnyxProvider';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import {isSearchQueryItem} from '@components/SelectionList/Search/SearchQueryListItem';
import type {SearchQueryItem} from '@components/SelectionList/Search/SearchQueryListItem';
import type {SelectionListHandle} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchActions from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import * as SearchAutocompleteUtils from '@libs/SearchAutocompleteUtils';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import variables from '@styles/variables';
import * as ReportUserActions from '@userActions/Report';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import type IconAsset from '@src/types/utils/IconAsset';
import {buildSubstitutionsMap} from './SearchRouter/buildSubstitutionsMap';
import {getQueryWithSubstitutions} from './SearchRouter/getQueryWithSubstitutions';
import type {SubstitutionMap} from './SearchRouter/getQueryWithSubstitutions';
import {getUpdatedSubstitutionsMap} from './SearchRouter/getUpdatedSubstitutionsMap';
import SearchButton from './SearchRouter/SearchButton';
import {useSearchRouterContext} from './SearchRouter/SearchRouterContext';
import SearchRouterInput from './SearchRouter/SearchRouterInput';
import SearchRouterList from './SearchRouter/SearchRouterList';
import type {SearchQueryJSON, SearchQueryString} from './types';

// When counting absolute positioning, we need to account for borders
const BORDER_WIDTH = 1;

type SearchPageHeaderInputProps = {
    queryJSON: SearchQueryJSON;
    children: React.ReactNode;
};

type HeaderContent = {
    icon: IconAsset;
    titleText: TranslationPaths;
};

function getHeaderContent(type: SearchDataTypes): HeaderContent {
    switch (type) {
        case CONST.SEARCH.DATA_TYPES.INVOICE:
            return {icon: Illustrations.EnvelopeReceipt, titleText: 'workspace.common.invoices'};
        case CONST.SEARCH.DATA_TYPES.TRIP:
            return {icon: Illustrations.Luggage, titleText: 'travel.trips'};
        case CONST.SEARCH.DATA_TYPES.CHAT:
            return {icon: Illustrations.CommentBubblesBlue, titleText: 'common.chats'};
        case CONST.SEARCH.DATA_TYPES.EXPENSE:
        default:
            return {icon: Illustrations.MoneyReceipts, titleText: 'common.expenses'};
    }
}

function SearchPageHeaderInput({queryJSON, children}: SearchPageHeaderInputProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const personalDetails = usePersonalDetails();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const taxRates = useMemo(() => getAllTaxRates(), []);

    const {type, inputQuery: originalInputQuery} = queryJSON;
    const isCannedQuery = SearchQueryUtils.isCannedSearchQuery(queryJSON);
    const queryText = SearchQueryUtils.buildUserReadableQueryString(queryJSON, personalDetails, reports, taxRates);
    const headerText = isCannedQuery ? translate(getHeaderContent(type).titleText) : '';

    // The actual input text that the user sees
    const [textInputValue, setTextInputValue] = useState(queryText);
    // The input text that was last used for autocomplete; needed for the SearchRouterList when browsing list via arrow keys
    const [autocompleteQueryValue, setAutocompleteQueryValue] = useState(queryText);

    const [autocompleteSubstitutions, setAutocompleteSubstitutions] = useState<SubstitutionMap>({});
    const [isAutocompleteListVisible, setIsAutocompleteListVisible] = useState(false);
    const listRef = useRef<SelectionListHandle>(null);
    const textInputRef = useRef<AnimatedTextInputRef>(null);
    const isFocused = useIsFocused();
    const {registerSearchPageInput, unregisterSearchPageInput} = useSearchRouterContext();

    // If query is non-canned that means Search Input is displayed, so we need to register its ref in the context.
    useEffect(() => {
        if (!isFocused) {
            return;
        }

        if (!isCannedQuery && textInputRef.current) {
            registerSearchPageInput(textInputRef.current);
        } else {
            unregisterSearchPageInput();
        }
    }, [isCannedQuery, isFocused, registerSearchPageInput, unregisterSearchPageInput]);

    useEffect(() => {
        setTextInputValue(queryText);
    }, [queryText]);

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
            const updatedQuery = SearchQueryUtils.getQueryWithUpdatedValues(queryWithSubstitutions, queryJSON.policyID);
            if (!updatedQuery) {
                return;
            }

            Navigation.navigate(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: updatedQuery}));

            if (updatedQuery !== originalInputQuery) {
                SearchActions.clearAllFilters();
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

    if (isCannedQuery) {
        const headerIcon = getHeaderContent(type).icon;

        return (
            <View
                dataSet={{dragArea: false}}
                style={[styles.headerBar, isCannedQuery && styles.headerBarDesktopHeight]}
            >
                <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.flexGrow1, styles.justifyContentBetween, styles.overflowHidden]}>
                    <Icon
                        src={headerIcon}
                        width={variables.iconHeader}
                        height={variables.iconHeader}
                        additionalStyles={[styles.mr2]}
                    />
                    <Header subtitle={<Text style={[styles.textLarge, styles.textHeadlineH2]}>{headerText}</Text>} />
                    <View style={[styles.reportOptions, styles.flexRow, styles.pr5, styles.alignItemsCenter, styles.gap2]}>
                        {children}
                        <SearchButton />
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
                    wrapperFocusedStyle={styles.searchRouterInputResultsFocused}
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
