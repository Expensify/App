import {useIsFocused} from '@react-navigation/native';
import {accountIDSelector} from '@selectors/Session';
import {deepEqual} from 'fast-equals';
import isEmpty from 'lodash/isEmpty';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {TextInputKeyPressEvent} from 'react-native';
import {View} from 'react-native';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import SearchAutocompleteList from '@components/Search/SearchAutocompleteList';
import SearchInputSelectionWrapper from '@components/Search/SearchInputSelectionWrapper';
import {buildSubstitutionsMap} from '@components/Search/SearchRouter/buildSubstitutionsMap';
import type {SubstitutionMap} from '@components/Search/SearchRouter/getQueryWithSubstitutions';
import {getQueryWithSubstitutions} from '@components/Search/SearchRouter/getQueryWithSubstitutions';
import {getUpdatedSubstitutionsMap} from '@components/Search/SearchRouter/getUpdatedSubstitutionsMap';
import {useSearchRouterActions} from '@components/Search/SearchRouter/SearchRouterContext';
import type {SearchQueryJSON, SearchQueryString} from '@components/Search/types';
import type {SelectionListWithSectionsHandle} from '@components/SelectionList/SelectionListWithSections/types';
import type {SearchQueryItem} from '@components/SelectionListWithSections/Search/SearchQueryListItem';
import {isSearchQueryItem} from '@components/SelectionListWithSections/Search/SearchQueryListItem';
import useFeedKeysWithAssignedCards from '@hooks/useFeedKeysWithAssignedCards';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateToAndOpenReport} from '@libs/actions/Report';
import {setSearchContext} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import {getAutocompleteQueryWithComma, getTrimmedUserSearchQueryPreservingComma} from '@libs/SearchAutocompleteUtils';
import {buildUserReadableQueryString, getQueryWithUpdatedValues, sanitizeSearchValue} from '@libs/SearchQueryUtils';
import StringUtils from '@libs/StringUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type SearchPageInputWideProps = {
    queryJSON: SearchQueryJSON;
    handleSearch: (value: string) => void;
};

function SearchPageInputWide({queryJSON, handleSearch}: SearchPageInputWideProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MagnifyingGlass']);
    const personalDetails = usePersonalDetails();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const taxRates = useMemo(() => getAllTaxRates(policies), [policies]);
    const [personalAndWorkspaceCards] = useOnyx(ONYXKEYS.DERIVED.PERSONAL_AND_WORKSPACE_CARD_LIST);
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const feedKeysWithCards = useFeedKeysWithAssignedCards();
    const {inputQuery: originalInputQuery} = queryJSON;
    const [currentUserAccountID = -1] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const queryText = buildUserReadableQueryString({
        queryJSON,
        PersonalDetails: personalDetails,
        reports,
        taxRates,
        cardList: personalAndWorkspaceCards,
        cardFeeds: allFeeds,
        policies,
        currentUserAccountID,
        autoCompleteWithSpace: true,
        translate,
        feedKeysWithCards,
        conciergeReportID,
    });

    const [searchContext] = useOnyx(ONYXKEYS.SEARCH_CONTEXT);
    const shouldShowQuery = searchContext?.shouldShowSearchQuery ?? false;

    const [textInputValue, setTextInputValue] = useState('');
    // The input text that was last used for autocomplete; needed for the SearchAutocompleteList when browsing list via arrow keys
    const [autocompleteQueryValue, setAutocompleteQueryValue] = useState('');
    const [selection, setSelection] = useState({start: textInputValue.length, end: textInputValue.length});

    const [autocompleteSubstitutions, setAutocompleteSubstitutions] = useState<SubstitutionMap>({});
    const [isAutocompleteListVisible, setIsAutocompleteListVisible] = useState(false);
    const listRef = useRef<SelectionListWithSectionsHandle>(null);
    const textInputRef = useRef<AnimatedTextInputRef>(null);
    const hasMountedRef = useRef(false);
    const isFocused = useIsFocused();
    const {registerSearchPageInput} = useSearchRouterActions();

    useEffect(() => {
        hasMountedRef.current = true;
    }, []);

    useEffect(() => {
        if (!isFocused || !textInputRef.current) {
            return;
        }

        registerSearchPageInput(textInputRef.current);
    }, [isFocused, registerSearchPageInput]);

    useEffect(() => {
        const newValue = shouldShowQuery ? queryText : '';

        setTextInputValue(newValue);
        setAutocompleteQueryValue(newValue);
    }, [queryText, shouldShowQuery]);

    useEffect(() => {
        const substitutionsMap = buildSubstitutionsMap(
            originalInputQuery,
            personalDetails,
            reports,
            taxRates,
            personalAndWorkspaceCards,
            allFeeds,
            policies,
            currentUserAccountID,
            translate,
            conciergeReportID,
        );
        setAutocompleteSubstitutions(substitutionsMap);
    }, [allFeeds, personalAndWorkspaceCards, originalInputQuery, personalDetails, reports, taxRates, policies, currentUserAccountID, translate, conciergeReportID]);

    const handleKeyPress = useCallback((e: TextInputKeyPressEvent) => {
        const keyEvent = e as unknown as KeyboardEvent;

        if (keyEvent.key === CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey && textInputRef.current?.isFocused()) {
            keyEvent.preventDefault();
            textInputRef.current.blur();
        }
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
            const singleLineUserQuery = StringUtils.lineBreaksToSpaces(userQuery, true);
            const updatedUserQuery = getAutocompleteQueryWithComma(textInputValue, singleLineUserQuery);
            setTextInputValue(updatedUserQuery);
            setAutocompleteQueryValue(updatedUserQuery);

            const updatedSubstitutionsMap = getUpdatedSubstitutionsMap(singleLineUserQuery, autocompleteSubstitutions);
            if (!deepEqual(autocompleteSubstitutions, updatedSubstitutionsMap) && !isEmpty(updatedSubstitutionsMap)) {
                setAutocompleteSubstitutions(updatedSubstitutionsMap);
            }
        },
        [autocompleteSubstitutions, setTextInputValue, textInputValue],
    );

    const submitSearch = useCallback(
        (queryString: SearchQueryString, shouldSkipAmountConversion = false) => {
            const queryWithSubstitutions = getQueryWithSubstitutions(queryString, autocompleteSubstitutions);
            const updatedQuery = getQueryWithUpdatedValues(queryWithSubstitutions, shouldSkipAmountConversion);

            if (!updatedQuery) {
                return;
            }

            setSearchContext(true);
            Navigation.navigate(
                ROUTES.SEARCH_ROOT.getRoute({
                    query: updatedQuery,
                    rawQuery: queryWithSubstitutions,
                }),
            );
            setIsAutocompleteListVisible(false);
            if (updatedQuery !== originalInputQuery) {
                setTextInputValue('');
                setAutocompleteQueryValue('');
            }
        },
        [autocompleteSubstitutions, originalInputQuery],
    );

    const onListItemPress = useCallback(
        (item: OptionData | SearchQueryItem) => {
            if (isSearchQueryItem(item)) {
                if (!item.searchQuery) {
                    return;
                }

                if (item.searchItemType === CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.AUTOCOMPLETE_SUGGESTION && textInputValue) {
                    const fieldKey = item.mapKey?.includes(':') ? item.mapKey.split(':').at(0) : item.mapKey;
                    const trimmedUserSearchQuery = getTrimmedUserSearchQueryPreservingComma(textInputValue, fieldKey);
                    const newSearchQuery = `${trimmedUserSearchQuery}${sanitizeSearchValue(item.searchQuery)}\u00A0`;

                    onSearchQueryChange(newSearchQuery);
                    setSelection({start: newSearchQuery.length, end: newSearchQuery.length});

                    if (item.mapKey && item.autocompleteID) {
                        const substitutions = {...autocompleteSubstitutions, [item.mapKey]: item.autocompleteID};
                        setAutocompleteSubstitutions(substitutions);
                    }
                } else if (item.searchItemType === CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.SEARCH) {
                    submitSearch(item.searchQuery, item.keyForList !== CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.FIND_ITEM);
                }
            } else if (item?.reportID) {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(item?.reportID));
            } else if ('login' in item) {
                navigateToAndOpenReport(item.login ? [item.login] : [], currentUserAccountID, introSelected, false);
            }
        },
        [autocompleteSubstitutions, onSearchQueryChange, submitSearch, textInputValue, currentUserAccountID, introSelected],
    );

    const searchQueryItem = useMemo(
        () =>
            textInputValue
                ? {
                      text: textInputValue,
                      singleIcon: expensifyIcons.MagnifyingGlass,
                      searchQuery: textInputValue,
                      itemStyle: styles.activeComponentBG,
                      keyForList: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.FIND_ITEM,
                      searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.SEARCH,
                  }
                : undefined,
        [textInputValue, expensifyIcons.MagnifyingGlass, styles.activeComponentBG],
    );

    const hideAutocompleteList = () => setIsAutocompleteListVisible(false);
    const showAutocompleteList = () => {
        setIsAutocompleteListVisible(true);
    };
    const autocompleteInputStyle = isAutocompleteListVisible
        ? [styles.border, styles.borderRadiusComponentLarge, styles.pAbsolute, styles.pt2, styles.w100, styles.zIndex10, {top: 0, maxWidth: 675}, {boxShadow: theme.shadow}]
        : [];
    const inputWrapperActiveStyle = isAutocompleteListVisible ? styles.ph2 : null;

    return (
        <>
            {/* An empty view as the input placeholder so that the applied filters won't move when the real input position becomes absolute */}
            {isAutocompleteListVisible && <View style={styles.searchPageInputPlaceholder} />}
            <View
                dataSet={{dragArea: false}}
                style={[styles.appBG, styles.searchResultsHeaderBar, ...autocompleteInputStyle]}
            >
                <SearchInputSelectionWrapper
                    value={textInputValue}
                    onSearchQueryChange={onSearchQueryChange}
                    isFullWidth
                    inputContainerStyle={isAutocompleteListVisible ? styles.ph3 : styles.ph2}
                    touchableInputWrapperStyle={isAutocompleteListVisible ? undefined : styles.searchPageInputTouchableWrapper}
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
                    outerWrapperStyle={[inputWrapperActiveStyle, styles.flex1]}
                    ref={textInputRef}
                    selection={selection}
                    substitutionMap={autocompleteSubstitutions}
                    onKeyPress={handleKeyPress}
                />
                {isAutocompleteListVisible && (
                    <View style={[styles.mh65vh]}>
                        <SearchAutocompleteList
                            autocompleteQueryValue={autocompleteQueryValue}
                            handleSearch={handleSearchAction}
                            searchQueryItem={searchQueryItem}
                            onListItemPress={onListItemPress}
                            ref={listRef}
                            shouldSubscribeToArrowKeyEvents={isAutocompleteListVisible}
                            personalDetails={personalDetails}
                            reports={reports}
                            allCards={personalAndWorkspaceCards}
                            allFeeds={allFeeds}
                            textInputRef={textInputRef}
                        />
                    </View>
                )}
            </View>
        </>
    );
}

export default SearchPageInputWide;
