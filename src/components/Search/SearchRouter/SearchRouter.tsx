import {useNavigationState} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {TextInputProps} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import {useOptionsList} from '@components/OptionListContextProvider';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import type {SearchQueryString} from '@components/Search/types';
import {isSearchQueryItem} from '@components/SelectionList/Search/SearchQueryListItem';
import type {SearchQueryItem} from '@components/SelectionList/Search/SearchQueryListItem';
import type {SelectionListHandle} from '@components/SelectionList/types';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useDebouncedState from '@hooks/useDebouncedState';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as InputUtils from '@libs/InputUtils';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import type {SearchOption} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import * as SearchAutocompleteUtils from '@libs/SearchAutocompleteUtils';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import * as ReportUserActions from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type Report from '@src/types/onyx/Report';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import {getQueryWithSubstitutions} from './getQueryWithSubstitutions';
import type {SubstitutionMap} from './getQueryWithSubstitutions';
import {getUpdatedSubstitutionsMap} from './getUpdatedSubstitutionsMap';
import SearchRouterInput from './SearchRouterInput';
import SearchRouterList from './SearchRouterList';

function getContextualSearchAutocompleteKey(item: SearchQueryItem) {
    if (item.roomType === CONST.SEARCH.DATA_TYPES.INVOICE) {
        return `${CONST.SEARCH.SYNTAX_FILTER_KEYS.TO}:${item.searchQuery}`;
    }
    if (item.roomType === CONST.SEARCH.DATA_TYPES.CHAT) {
        return `${CONST.SEARCH.SYNTAX_FILTER_KEYS.IN}:${item.searchQuery}`;
    }
}

function getContextualSearchQuery(item: SearchQueryItem) {
    const baseQuery = `${CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.TYPE}:${item.roomType}`;
    let additionalQuery = '';

    switch (item.roomType) {
        case CONST.SEARCH.DATA_TYPES.EXPENSE:
        case CONST.SEARCH.DATA_TYPES.INVOICE:
            additionalQuery += ` ${CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.POLICY_ID}:${item.policyID}`;
            if (item.roomType === CONST.SEARCH.DATA_TYPES.INVOICE && item.autocompleteID) {
                additionalQuery += ` ${CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.TO}:${SearchQueryUtils.sanitizeSearchValue(item.searchQuery ?? '')}`;
            }
            break;
        case CONST.SEARCH.DATA_TYPES.CHAT:
        default:
            additionalQuery = ` ${CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.IN}:${SearchQueryUtils.sanitizeSearchValue(item.searchQuery ?? '')}`;
            break;
    }
    return baseQuery + additionalQuery;
}

type SearchRouterProps = {
    onRouterClose: () => void;
    shouldHideInputCaret?: TextInputProps['caretHidden'];
};

function SearchRouter({onRouterClose, shouldHideInputCaret}: SearchRouterProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [, recentSearchesMetadata] = useOnyx(ONYXKEYS.RECENT_SEARCHES);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});
    const {activeWorkspaceID} = useActiveWorkspace();

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const listRef = useRef<SelectionListHandle>(null);

    // The actual input text that the user sees
    const [textInputValue, , setTextInputValue] = useDebouncedState('', 500);
    // The input text that was last used for autocomplete; needed for the SearchRouterList when browsing list via arrow keys
    const [autocompleteQueryValue, setAutocompleteQueryValue] = useState(textInputValue);
    const [autocompleteSubstitutions, setAutocompleteSubstitutions] = useState<SubstitutionMap>({});
    const textInputRef = useRef<AnimatedTextInputRef>(null);

    const contextualReportID = useNavigationState<Record<string, {reportID: string}>, string | undefined>((state) => {
        return state?.routes.at(-1)?.params?.reportID;
    });

    const {options, areOptionsInitialized} = useOptionsList();
    const searchOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return {recentReports: [], personalDetails: [], userToInvite: null, currentUserOption: null};
        }
        return OptionsListUtils.getSearchOptions(options, betas ?? []);
    }, [areOptionsInitialized, betas, options]);

    const reportForContextualSearch = contextualReportID ? searchOptions.recentReports?.find((option) => option.reportID === contextualReportID) : undefined;

    const additionalSections = [];

    if (reportForContextualSearch && !textInputValue) {
        const reportQueryValue = reportForContextualSearch.text ?? reportForContextualSearch.alternateText ?? reportForContextualSearch.reportID;

        let roomType: ValueOf<typeof CONST.SEARCH.DATA_TYPES> = CONST.SEARCH.DATA_TYPES.CHAT;
        let autocompleteID = reportForContextualSearch.reportID;
        if (reportForContextualSearch.isInvoiceRoom) {
            roomType = CONST.SEARCH.DATA_TYPES.INVOICE;
            const report = reportForContextualSearch as SearchOption<Report>;
            if (report.item && report.item?.invoiceReceiver && report.item.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL) {
                autocompleteID = report.item.invoiceReceiver.accountID.toString();
            } else {
                autocompleteID = '';
            }
        }
        if (reportForContextualSearch.isPolicyExpenseChat) {
            roomType = CONST.SEARCH.DATA_TYPES.EXPENSE;
            autocompleteID = reportForContextualSearch.policyID ?? '';
        }

        additionalSections.push({
            data: [
                {
                    text: `${translate('search.searchIn')} ${reportForContextualSearch.text ?? reportForContextualSearch.alternateText}`,
                    singleIcon: Expensicons.MagnifyingGlass,
                    searchQuery: reportQueryValue,
                    autocompleteID,
                    itemStyle: styles.activeComponentBG,
                    keyForList: 'contextualSearch',
                    searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.CONTEXTUAL_SUGGESTION,
                    roomType,
                    policyID: reportForContextualSearch.policyID,
                },
            ],
        });
    }

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

    const shouldScrollRef = useRef(false);
    // Trigger scrollToRight when input value changes and shouldScroll is true
    useEffect(() => {
        if (!textInputRef.current || !shouldScrollRef.current) {
            return;
        }

        InputUtils.scrollToRight(textInputRef.current);
        shouldScrollRef.current = false;
    }, []);

    const onSearchQueryChange = useCallback(
        (userQuery: string, autoScrollToRight = false) => {
            if (autoScrollToRight) {
                shouldScrollRef.current = true;
            }
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
            const updatedQuery = SearchQueryUtils.getQueryWithUpdatedValues(queryWithSubstitutions, activeWorkspaceID);
            if (!updatedQuery) {
                return;
            }

            onRouterClose();
            Navigation.navigate(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: updatedQuery}));

            setTextInputValue('');
            setAutocompleteQueryValue('');
        },
        [autocompleteSubstitutions, onRouterClose, setTextInputValue, activeWorkspaceID],
    );

    const onListItemPress = useCallback(
        (item: OptionData | SearchQueryItem) => {
            if (isSearchQueryItem(item)) {
                if (!item.searchQuery) {
                    return;
                }

                if (item.searchItemType === CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.CONTEXTUAL_SUGGESTION) {
                    const searchQuery = getContextualSearchQuery(item);
                    onSearchQueryChange(`${searchQuery} `, true);

                    const autocompleteKey = getContextualSearchAutocompleteKey(item);
                    if (autocompleteKey && item.autocompleteID) {
                        const substitutions = {...autocompleteSubstitutions, [autocompleteKey]: item.autocompleteID};

                        setAutocompleteSubstitutions(substitutions);
                    }
                } else if (item.searchItemType === CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.AUTOCOMPLETE_SUGGESTION && textInputValue) {
                    const trimmedUserSearchQuery = SearchAutocompleteUtils.getQueryWithoutAutocompletedPart(textInputValue);
                    onSearchQueryChange(`${trimmedUserSearchQuery}${SearchQueryUtils.sanitizeSearchValue(item.searchQuery)} `);

                    if (item.mapKey && item.autocompleteID) {
                        const substitutions = {...autocompleteSubstitutions, [item.mapKey]: item.autocompleteID};

                        setAutocompleteSubstitutions(substitutions);
                    }
                    // needed for android mWeb
                    textInputRef.current?.focus();
                } else {
                    submitSearch(item.searchQuery);
                }
            } else {
                onRouterClose();

                if (item?.reportID) {
                    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(item?.reportID));
                } else if ('login' in item) {
                    ReportUserActions.navigateToAndOpenReport(item.login ? [item.login] : [], false);
                }
            }
        },
        [autocompleteSubstitutions, onRouterClose, onSearchQueryChange, submitSearch, textInputValue],
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

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, () => {
        onRouterClose();
    });

    const modalWidth = shouldUseNarrowLayout ? styles.w100 : {width: variables.searchRouterPopoverWidth};
    const isRecentSearchesDataLoaded = !isLoadingOnyxValue(recentSearchesMetadata);

    return (
        <View
            style={[styles.flex1, modalWidth, styles.h100, !shouldUseNarrowLayout && styles.mh85vh]}
            testID={SearchRouter.displayName}
        >
            {shouldUseNarrowLayout && (
                <HeaderWithBackButton
                    title={translate('common.search')}
                    onBackButtonPress={() => onRouterClose()}
                />
            )}
            {isRecentSearchesDataLoaded && (
                <>
                    <SearchRouterInput
                        value={textInputValue}
                        isFullWidth={shouldUseNarrowLayout}
                        onSearchQueryChange={onSearchQueryChange}
                        onSubmit={() => {
                            submitSearch(textInputValue);
                        }}
                        caretHidden={shouldHideInputCaret}
                        routerListRef={listRef}
                        shouldShowOfflineMessage
                        wrapperStyle={[styles.border, styles.alignItemsCenter]}
                        outerWrapperStyle={[shouldUseNarrowLayout ? styles.mv3 : styles.mv2, shouldUseNarrowLayout ? styles.mh5 : styles.mh2]}
                        wrapperFocusedStyle={[styles.borderColorFocus]}
                        isSearchingForReports={isSearchingForReports}
                        ref={textInputRef}
                    />
                    <SearchRouterList
                        autocompleteQueryValue={autocompleteQueryValue || textInputValue}
                        searchQueryItem={searchQueryItem}
                        additionalSections={additionalSections}
                        onListItemPress={onListItemPress}
                        setTextQuery={setTextInputValue}
                        updateAutocompleteSubstitutions={updateAutocompleteSubstitutions}
                        ref={listRef}
                    />
                </>
            )}
        </View>
    );
}

SearchRouter.displayName = 'SearchRouter';

export default SearchRouter;
