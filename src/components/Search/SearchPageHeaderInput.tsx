import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Header from '@components/Header';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import {usePersonalDetails} from '@components/OnyxProvider';
import {buildSubstitutionsMap} from '@components/Search/SearchRouter/buildSubstitutionsMap';
import type {SelectionListHandle} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchActions from '@libs/actions/Search';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {parseForAutocomplete} from '@libs/SearchAutocompleteUtils';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import type IconAsset from '@src/types/utils/IconAsset';
import {getQueryWithSubstitutions} from './SearchRouter/getQueryWithSubstitutions';
import type {SubstitutionMap} from './SearchRouter/getQueryWithSubstitutions';
import {getUpdatedSubstitutionsMap} from './SearchRouter/getUpdatedSubstitutionsMap';
import SearchButton from './SearchRouter/SearchButton';
import SearchRouterInput from './SearchRouter/SearchRouterInput';
import SearchRouterList from './SearchRouter/SearchRouterList';
import type {SearchQueryJSON, SearchQueryString} from './types';

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
    const taxRates = getAllTaxRates();
    const [cardList = {}] = useOnyx(ONYXKEYS.CARD_LIST);

    const [autocompleteSubstitutions, setAutocompleteSubstitutions] = useState<SubstitutionMap>({});
    // The actual input text that the user sees
    const [textInputValue, setTextInputValue] = useState('');
    // The input text that was last used for autocomplete; needed for the SearchRouterLiteList when browsing list via arrow keys
    const [autocompleteInputValue, setAutocompleteInputValue] = useState(textInputValue);

    const [displayAutocompleteList, setDisplayAutocompleteList] = useState(true);
    const listRef = useRef<SelectionListHandle>(null);

    const {type} = queryJSON;
    const isCannedQuery = SearchQueryUtils.isCannedSearchQuery(queryJSON);
    const headerText = isCannedQuery ? translate(getHeaderContent(type).titleText) : '';
    const queryText = SearchQueryUtils.buildUserReadableQueryString(queryJSON, personalDetails, cardList, reports, taxRates);

    useEffect(() => {
        // Todo handle setting a new text
        // const foobar = buildSubstitutionsMap(queryText);
        setTextInputValue(queryText);
    }, [queryText]);

    const onSearchQueryChange = useCallback(
        (userQuery: string) => {
            const prevParsedQuery = parseForAutocomplete(textInputValue);

            let updatedUserQuery = userQuery;
            // If the prev value was query with autocomplete, and the current query ends with a comma, then we allow to continue autocompleting the next value
            if (prevParsedQuery?.autocomplete && userQuery.endsWith(',')) {
                updatedUserQuery = `${userQuery.slice(0, userQuery.length - 1).trim()},`;
            }
            setTextInputValue(updatedUserQuery);
            setAutocompleteInputValue(updatedUserQuery);

            const updatedSubstitutionsMap = getUpdatedSubstitutionsMap(userQuery, autocompleteSubstitutions);
            setAutocompleteSubstitutions(updatedSubstitutionsMap);

            if (updatedUserQuery) {
                listRef.current?.updateAndScrollToFocusedIndex(0);
            } else {
                listRef.current?.updateAndScrollToFocusedIndex(-1);
            }
        },
        [autocompleteSubstitutions, setTextInputValue, textInputValue],
    );

    const onSearchSubmit = useCallback(
        (queryString: SearchQueryString) => {
            const cleanedQueryString = getQueryWithSubstitutions(queryString, autocompleteSubstitutions);
            const inputQueryJSON = SearchQueryUtils.buildSearchQueryJSON(cleanedQueryString);
            if (!inputQueryJSON) {
                return;
            }

            const standardizedQuery = SearchQueryUtils.traverseAndUpdatedQuery(inputQueryJSON, SearchQueryUtils.getUpdatedAmountValue);
            const query = SearchQueryUtils.buildSearchQueryString(standardizedQuery);
            Navigation.navigate(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query}));

            SearchActions.clearAllFilters();
            setTextInputValue('');
            setAutocompleteInputValue('');
            setDisplayAutocompleteList(false);

            // Todo Old
            // const inputQueryJSON = SearchQueryUtils.buildSearchQueryJSON('');
            // if (inputQueryJSON) {
            //     // Todo traverse the tree to update all the display values into id values; this is only temporary until autocomplete code from SearchRouter is implement here
            //     // After https://github.com/Expensify/App/pull/51633 is merged, autocomplete functionality will be included into this component, and `getFindIDFromDisplayValue` can be removed
            //     const computeNodeValueFn = SearchQueryUtils.getFindIDFromDisplayValue(cardList, taxRates);
            //     const standardizedQuery = SearchQueryUtils.traverseAndUpdatedQuery(inputQueryJSON, computeNodeValueFn);
            //     const query = SearchQueryUtils.buildSearchQueryString(standardizedQuery);
            // } else {
            //     Log.alert(`${CONST.ERROR.ENSURE_BUGBOT} user query failed to parse`, {}, false);
            // }
        },
        [autocompleteSubstitutions],
    );

    const onAutocompleteSuggestionClick = (autocompleteKey: string, autocompleteID: string) => {
        const substitutions = {...autocompleteSubstitutions, [autocompleteKey]: autocompleteID};

        setAutocompleteSubstitutions(substitutions);
    };

    const hideAutocompleteList = () => setDisplayAutocompleteList(false);
    const showAutocompleteList = () => setDisplayAutocompleteList(true);

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

    const autocompleteParsedQuery = parseForAutocomplete(autocompleteInputValue);
    const isListVisible = !!autocompleteParsedQuery?.autocomplete && displayAutocompleteList;

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
            style={styles.searchResultsHeaderBar}
        >
            <SearchRouterInput
                value={textInputValue}
                onSearchQueryChange={onSearchQueryChange}
                isFullWidth
                onSubmit={() => {
                    onSearchSubmit(textInputValue);
                }}
                autoFocus={false}
                onFocus={showAutocompleteList}
                onBlur={hideAutocompleteList}
                wrapperStyle={[styles.searchRouterInputResults, styles.br2]}
                wrapperFocusedStyle={styles.searchRouterInputResultsFocused}
                rightComponent={children}
                routerListRef={listRef}
            />
            <View
                style={[
                    styles.mh85vh,
                    styles.pAbsolute,
                    styles.appBG,
                    styles.pt2,
                    !isListVisible && styles.dNone,
                    isListVisible && styles.border,
                    {top: variables.contentHeaderHeight - 9, left: 20, right: 20},
                ]}
            >
                <SearchRouterList
                    textInputValue={autocompleteInputValue}
                    searchQueryItem={searchQueryItem}
                    setTextInputValue={setTextInputValue}
                    onSearchQueryChange={onSearchQueryChange}
                    onSearchSubmit={onSearchSubmit}
                    closeRouter={hideAutocompleteList}
                    onAutocompleteSuggestionClick={onAutocompleteSuggestionClick}
                    ref={listRef}
                />
            </View>
        </View>
    );
}

SearchPageHeaderInput.displayName = 'SearchPageHeaderInput';

export default SearchPageHeaderInput;
