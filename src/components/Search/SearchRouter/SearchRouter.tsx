import {findFocusedRoute} from '@react-navigation/native';
import {deepEqual} from 'fast-equals';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {TextInputProps} from 'react-native';
import {InteractionManager, View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import type {GetAdditionalSectionsCallback} from '@components/Search/SearchAutocompleteList';
import SearchAutocompleteList from '@components/Search/SearchAutocompleteList';
import {useSearchContext} from '@components/Search/SearchContext';
import SearchInputSelectionWrapper from '@components/Search/SearchInputSelectionWrapper';
import type {SearchFilterKey, SearchQueryString} from '@components/Search/types';
import type {SearchQueryItem} from '@components/SelectionListWithSections/Search/SearchQueryListItem';
import {isSearchQueryItem} from '@components/SelectionListWithSections/Search/SearchQueryListItem';
import type {SelectionListHandle} from '@components/SelectionListWithSections/types';
import useDebouncedState from '@hooks/useDebouncedState';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useThemeStyles from '@hooks/useThemeStyles';
import {filterPersonalCards, mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import {scrollToRight} from '@libs/InputUtils';
import Log from '@libs/Log';
import backHistory from '@libs/Navigation/helpers/backHistory';
import type {SearchOption} from '@libs/OptionsListUtils';
import {createOptionFromReport} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import {getReportAction} from '@libs/ReportActionsUtils';
import {getReportOrDraftReport} from '@libs/ReportUtils';
import type {OptionData} from '@libs/ReportUtils';
import {getAutocompleteQueryWithComma, getQueryWithoutAutocompletedPart} from '@libs/SearchAutocompleteUtils';
import {getPolicyNameWithFallback, getQueryWithUpdatedValues, sanitizeSearchValue} from '@libs/SearchQueryUtils';
import StringUtils from '@libs/StringUtils';
import Navigation from '@navigation/Navigation';
import type {ReportsSplitNavigatorParamList} from '@navigation/types';
import variables from '@styles/variables';
import {navigateToAndOpenReport, searchInServer} from '@userActions/Report';
import {setSearchContext} from '@userActions/Search';
import CONST, {CONTINUATION_DETECTION_SEARCH_FILTER_KEYS} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type Report from '@src/types/onyx/Report';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import type {SubstitutionMap} from './getQueryWithSubstitutions';
import {getQueryWithSubstitutions} from './getQueryWithSubstitutions';
import {getUpdatedSubstitutionsMap} from './getUpdatedSubstitutionsMap';

function getContextualSearchAutocompleteKey(item: SearchQueryItem, policies: OnyxCollection<OnyxTypes.Policy>, reports?: OnyxCollection<OnyxTypes.Report>) {
    if (item.roomType === CONST.SEARCH.DATA_TYPES.INVOICE) {
        return `${CONST.SEARCH.SYNTAX_FILTER_KEYS.TO}:${item.searchQuery}`;
    }
    if (item.roomType === CONST.SEARCH.DATA_TYPES.CHAT) {
        return `${CONST.SEARCH.SYNTAX_FILTER_KEYS.IN}:${item.searchQuery}`;
    }
    if (item.roomType === CONST.SEARCH.DATA_TYPES.EXPENSE) {
        return `${CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID}:${item.policyID ? getPolicyNameWithFallback(item.policyID, policies, reports) : ''}`;
    }
}

function getContextualSearchQuery(item: SearchQueryItem, policies: OnyxCollection<OnyxTypes.Policy>, reports?: OnyxCollection<OnyxTypes.Report>) {
    const baseQuery = `${CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.TYPE}:${item.roomType}`;
    let additionalQuery = '';

    switch (item.roomType) {
        case CONST.SEARCH.DATA_TYPES.EXPENSE:
            additionalQuery += ` ${CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.POLICY_ID}:${sanitizeSearchValue(item.policyID ? getPolicyNameWithFallback(item.policyID, policies, reports) : '')}`;
            break;
        case CONST.SEARCH.DATA_TYPES.INVOICE:
            additionalQuery += ` ${CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.POLICY_ID}:${item.policyID}`;
            if (item.autocompleteID) {
                additionalQuery += ` ${CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.TO}:${sanitizeSearchValue(item.searchQuery ?? '')}`;
            }
            break;
        case CONST.SEARCH.DATA_TYPES.CHAT:
        default:
            additionalQuery = ` ${CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.IN}:${sanitizeSearchValue(item.searchQuery ?? '')}`;
            break;
    }
    return baseQuery + additionalQuery;
}

type SearchRouterProps = {
    onRouterClose: () => void;
    shouldHideInputCaret?: TextInputProps['caretHidden'];
    isSearchRouterDisplayed?: boolean;
    ref?: React.Ref<View>;
};

function SearchRouter({onRouterClose, shouldHideInputCaret, isSearchRouterDisplayed, ref}: SearchRouterProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {actions} = useSearchContext();
    const {setShouldResetSearchQuery} = actions;
    const [, recentSearchesMetadata] = useOnyx(ONYXKEYS.RECENT_SEARCHES, {canBeMissing: true});
    const {areOptionsInitialized} = useOptionsList();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const isRecentSearchesDataLoaded = !isLoadingOnyxValue(recentSearchesMetadata);
    const shouldShowList = isRecentSearchesDataLoaded && areOptionsInitialized;
    const personalDetails = usePersonalDetails();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});
    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST, {selector: filterPersonalCards, canBeMissing: true});
    const allCards = useMemo(() => mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, userCardList), [userCardList, workspaceCardFeeds]);
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER, {canBeMissing: true});
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const listRef = useRef<SelectionListHandle>(null);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MagnifyingGlass']);

    // The actual input text that the user sees
    const [textInputValue, , setTextInputValue] = useDebouncedState('', 500);
    // The input text that was last used for autocomplete; needed for the SearchAutocompleteList when browsing list via arrow keys
    const [autocompleteQueryValue, setAutocompleteQueryValue] = useState(textInputValue);
    const [selection, setSelection] = useState({start: textInputValue.length, end: textInputValue.length});
    const [autocompleteSubstitutions, setAutocompleteSubstitutions] = useState<SubstitutionMap>({});
    const textInputRef = useRef<AnimatedTextInputRef>(null);

    const contextualReportID = useRootNavigationState((state) => {
        // Safe handling when navigation is not yet initialized
        if (!state) {
            return undefined;
        }

        const focusedRoute = findFocusedRoute(state);
        if (focusedRoute?.name === SCREENS.REPORT || focusedRoute?.name === SCREENS.RIGHT_MODAL.EXPENSE_REPORT) {
            // We're guaranteed that the type of params is of SCREENS.REPORT
            return (focusedRoute.params as ReportsSplitNavigatorParamList[typeof SCREENS.REPORT]).reportID;
        }
    });

    const getAdditionalSections: GetAdditionalSectionsCallback = useCallback(
        ({recentReports}) => {
            if (!contextualReportID) {
                return undefined;
            }

            // We will only show the contextual search suggestion if the user has not typed anything
            if (textInputValue) {
                return undefined;
            }

            if (!isSearchRouterDisplayed) {
                return undefined;
            }
            let reportForContextualSearch = recentReports.find((option) => option.reportID === contextualReportID);
            const reportForContextualSearchReport = getReportOrDraftReport(reportForContextualSearch?.reportID);
            const reportAction = getReportAction(reportForContextualSearchReport?.parentReportID, reportForContextualSearchReport?.parentReportActionID);
            const shouldParserToHTML = reportAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT;
            if (!reportForContextualSearch) {
                const report = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${contextualReportID}`];
                if (!report) {
                    return undefined;
                }

                const option = createOptionFromReport(report, personalDetails, undefined, {showPersonalDetails: true});
                reportForContextualSearch = option;
            }

            const reportQueryValue = reportForContextualSearch.text ?? reportForContextualSearch.alternateText ?? reportForContextualSearch.reportID;

            let roomType: ValueOf<typeof CONST.SEARCH.DATA_TYPES> = CONST.SEARCH.DATA_TYPES.CHAT;
            let autocompleteID: string | undefined = reportForContextualSearch.reportID;

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
                if (reportForContextualSearch.policyID) {
                    autocompleteID = reportForContextualSearch.policyID;
                } else {
                    autocompleteID = '';
                }
            }

            return [
                {
                    data: [
                        {
                            text: StringUtils.lineBreaksToSpaces(
                                `${translate('search.searchIn')} ${
                                    shouldParserToHTML
                                        ? Parser.htmlToText(reportForContextualSearch.text ?? reportForContextualSearch.alternateText ?? '')
                                        : (reportForContextualSearch.text ?? reportForContextualSearch.alternateText ?? '')
                                }`,
                            ),
                            singleIcon: expensifyIcons.MagnifyingGlass,
                            searchQuery: reportQueryValue,
                            autocompleteID,
                            itemStyle: styles.activeComponentBG,
                            keyForList: 'contextualSearch',
                            searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.CONTEXTUAL_SUGGESTION,
                            roomType,
                            policyID: reportForContextualSearch.policyID,
                        },
                    ],
                },
            ];
        },
        [contextualReportID, textInputValue, isSearchRouterDisplayed, translate, expensifyIcons.MagnifyingGlass, styles.activeComponentBG, reports, personalDetails],
    );

    const searchQueryItem = textInputValue
        ? {
              text: textInputValue,
              singleIcon: expensifyIcons.MagnifyingGlass,
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

        scrollToRight(textInputRef.current);
        shouldScrollRef.current = false;
    }, [textInputValue]);

    const onSearchQueryChange = useCallback(
        (userQuery: string, autoScrollToRight = false) => {
            const actionId = `search_query_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            const startTime = Date.now();

            Log.info('[CMD_K_DEBUG] Search query change started', false, {
                actionId,
                inputLength: userQuery.length,
                previousInputLength: textInputValue.length,
                autoScrollToRight,
                timestamp: startTime,
            });

            try {
                if (autoScrollToRight) {
                    shouldScrollRef.current = true;
                }
                const singleLineUserQuery = StringUtils.lineBreaksToSpaces(userQuery, true);
                const updatedUserQuery = getAutocompleteQueryWithComma(textInputValue, singleLineUserQuery);
                setTextInputValue(updatedUserQuery);
                setAutocompleteQueryValue(updatedUserQuery);

                const updatedSubstitutionsMap = getUpdatedSubstitutionsMap(singleLineUserQuery, autocompleteSubstitutions);
                if (!deepEqual(autocompleteSubstitutions, updatedSubstitutionsMap)) {
                    setAutocompleteSubstitutions(updatedSubstitutionsMap);
                }

                if (updatedUserQuery || textInputValue.length > 0) {
                    listRef.current?.updateAndScrollToFocusedIndex(0);
                } else {
                    listRef.current?.updateAndScrollToFocusedIndex(-1);
                }

                const endTime = Date.now();
                Log.info('[CMD_K_DEBUG] Search query change completed', false, {
                    actionId,
                    duration: endTime - startTime,
                    finalInputLength: updatedUserQuery.length,
                    substitutionsUpdated: !deepEqual(autocompleteSubstitutions, updatedSubstitutionsMap),
                    timestamp: endTime,
                });
            } catch (error) {
                const endTime = Date.now();
                Log.alert('[CMD_K_FREEZE] Search query change failed', {
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

            // Reset the search query flag when performing a new search
            setShouldResetSearchQuery(false);

            backHistory(() => {
                onRouterClose();
                setSearchContext(true);
                Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: updatedQuery}));
            });

            setTextInputValue('');
            setAutocompleteQueryValue('');
        },
        [autocompleteSubstitutions, onRouterClose, setTextInputValue, setShouldResetSearchQuery],
    );

    const setTextAndUpdateSelection = useCallback(
        (text: string) => {
            setTextInputValue(text);
            shouldScrollRef.current = true;
            setSelection({start: text.length, end: text.length});
        },
        [setSelection, setTextInputValue],
    );

    const onListItemPress = useCallback(
        (item: OptionData | SearchQueryItem) => {
            const actionId = `list_item_press_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            const startTime = Date.now();

            Log.info('[CMD_K_DEBUG] List item press started', false, {
                actionId,
                itemType: isSearchQueryItem(item) ? 'SearchQueryItem' : 'OptionData',
                searchItemType: isSearchQueryItem(item) ? item.searchItemType : undefined,
                hasSearchQuery: isSearchQueryItem(item) ? !!item.searchQuery : undefined,
                hasReportID: 'reportID' in item ? !!item.reportID : undefined,
                hasLogin: 'login' in item ? !!item.login : undefined,
                timestamp: startTime,
            });

            const setFocusAndScrollToRight = () => {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    InteractionManager.runAfterInteractions(() => {
                        if (!textInputRef.current) {
                            Log.info('[CMD_K_DEBUG] Focus skipped - no text input ref', false, {
                                actionId,
                                timestamp: Date.now(),
                            });
                            return;
                        }
                        textInputRef.current.focus();
                        scrollToRight(textInputRef.current);
                    });
                } catch (error) {
                    Log.alert('[CMD_K_FREEZE] Focus and scroll failed', {
                        actionId,
                        error: String(error),
                        timestamp: Date.now(),
                    });
                }
            };

            try {
                if (isSearchQueryItem(item)) {
                    if (!item.searchQuery) {
                        Log.info('[CMD_K_DEBUG] List item press skipped - no search query', false, {
                            actionId,
                            itemType: 'SearchQueryItem',
                            timestamp: Date.now(),
                        });
                        return;
                    }

                    if (item.searchItemType === CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.CONTEXTUAL_SUGGESTION) {
                        const searchQuery = getContextualSearchQuery(item, policies, reports);
                        const newSearchQuery = `${searchQuery}\u00A0`;
                        onSearchQueryChange(newSearchQuery, true);
                        setSelection({start: newSearchQuery.length, end: newSearchQuery.length});

                        const autocompleteKey = getContextualSearchAutocompleteKey(item, policies, reports);
                        if (autocompleteKey && item.autocompleteID) {
                            const substitutions = {...autocompleteSubstitutions, [autocompleteKey]: item.autocompleteID};
                            setAutocompleteSubstitutions(substitutions);
                        }
                        setFocusAndScrollToRight();

                        const endTime = Date.now();
                        Log.info('[CMD_K_DEBUG] Contextual suggestion handled', false, {
                            actionId,
                            duration: endTime - startTime,
                            newQueryLength: newSearchQuery.length,
                            hasSubstitutions: !!(autocompleteKey && item.autocompleteID),
                            timestamp: endTime,
                        });
                    } else if (item.searchItemType === CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.AUTOCOMPLETE_SUGGESTION && textInputValue) {
                        const fieldKey = item.mapKey?.includes(':') ? item.mapKey.split(':').at(0) : item.mapKey;
                        const isNameField = fieldKey && CONTINUATION_DETECTION_SEARCH_FILTER_KEYS.includes(fieldKey as SearchFilterKey);

                        let trimmedUserSearchQuery;
                        if (isNameField && fieldKey) {
                            const fieldPattern = `${fieldKey}:`;
                            const keyIndex = textInputValue.toLowerCase().lastIndexOf(fieldPattern.toLowerCase());

                            if (keyIndex !== -1) {
                                const afterFieldKey = textInputValue.substring(keyIndex + fieldPattern.length);
                                const lastCommaIndex = afterFieldKey.lastIndexOf(',');

                                if (lastCommaIndex !== -1) {
                                    trimmedUserSearchQuery = textInputValue.substring(0, keyIndex + fieldPattern.length + lastCommaIndex + 1);
                                } else {
                                    trimmedUserSearchQuery = textInputValue.substring(0, keyIndex + fieldPattern.length);
                                }
                            } else {
                                trimmedUserSearchQuery = getQueryWithoutAutocompletedPart(textInputValue);
                            }
                        } else {
                            const keyIndex = fieldKey ? textInputValue.toLowerCase().lastIndexOf(`${fieldKey}:`) : -1;
                            trimmedUserSearchQuery =
                                keyIndex !== -1 && fieldKey ? textInputValue.substring(0, keyIndex + fieldKey.length + 1) : getQueryWithoutAutocompletedPart(textInputValue);
                        }

                        const newSearchQuery = `${trimmedUserSearchQuery}${sanitizeSearchValue(item.searchQuery)}\u00A0`;
                        onSearchQueryChange(newSearchQuery, true);
                        setSelection({start: newSearchQuery.length, end: newSearchQuery.length});

                        if (item.mapKey && item.autocompleteID) {
                            const substitutions = {...autocompleteSubstitutions, [item.mapKey]: item.autocompleteID};
                            setAutocompleteSubstitutions(substitutions);
                        }
                        setFocusAndScrollToRight();

                        const endTime = Date.now();
                        Log.info('[CMD_K_DEBUG] Autocomplete suggestion handled', false, {
                            actionId,
                            duration: endTime - startTime,
                            trimmedQueryLength: trimmedUserSearchQuery.length,
                            newQueryLength: newSearchQuery.length,
                            hasMapKey: !!(item.mapKey && item.autocompleteID),
                            timestamp: endTime,
                        });
                    } else {
                        submitSearch(item.searchQuery);

                        const endTime = Date.now();
                        Log.info('[CMD_K_DEBUG] Search submitted', false, {
                            actionId,
                            duration: endTime - startTime,
                            searchQuery: item.searchQuery,
                            timestamp: endTime,
                        });
                    }
                } else {
                    backHistory(() => {
                        if (item?.reportID) {
                            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(item.reportID));
                        } else if ('login' in item) {
                            navigateToAndOpenReport(item.login ? [item.login] : [], false);
                        }
                    });
                    onRouterClose();

                    const endTime = Date.now();
                    Log.info('[CMD_K_DEBUG] Navigation item handled', false, {
                        actionId,
                        duration: endTime - startTime,
                        reportID: item?.reportID,
                        hasLogin: 'login' in item ? !!item.login : false,
                        timestamp: endTime,
                    });
                }
            } catch (error) {
                const endTime = Date.now();
                Log.alert('[CMD_K_FREEZE] List item press failed', {
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
        [autocompleteSubstitutions, onRouterClose, onSearchQueryChange, policies, reports, submitSearch, textInputValue],
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
    const updateAndScrollToFocusedIndex = useCallback(() => listRef.current?.updateAndScrollToFocusedIndex(1, true), []);

    const modalWidth = shouldUseNarrowLayout ? styles.w100 : {width: variables.searchRouterPopoverWidth};

    return (
        <View
            style={[styles.flex1, modalWidth, styles.h100, !shouldUseNarrowLayout && styles.mh85vh]}
            testID="SearchRouter"
            ref={ref}
        >
            {shouldUseNarrowLayout && (
                <HeaderWithBackButton
                    title={translate('common.search')}
                    onBackButtonPress={() => onRouterClose()}
                    shouldDisplayHelpButton={false}
                />
            )}
            <View style={[shouldUseNarrowLayout ? styles.mv3 : styles.mv2, shouldUseNarrowLayout ? styles.mh5 : styles.mh2]}>
                <SearchInputSelectionWrapper
                    value={textInputValue}
                    isFullWidth={shouldUseNarrowLayout}
                    onSearchQueryChange={onSearchQueryChange}
                    onSubmit={() => {
                        const focusedOption = listRef.current?.getFocusedOption();

                        if (!focusedOption) {
                            submitSearch(textInputValue);
                            return;
                        }

                        onListItemPress(focusedOption);
                    }}
                    caretHidden={shouldHideInputCaret}
                    autocompleteListRef={listRef}
                    shouldShowOfflineMessage
                    wrapperStyle={{...styles.border, ...styles.alignItemsCenter}}
                    wrapperFocusedStyle={styles.borderColorFocus}
                    isSearchingForReports={!!isSearchingForReports}
                    selection={selection}
                    substitutionMap={autocompleteSubstitutions}
                    ref={textInputRef}
                    shouldDelayFocus
                />
            </View>
            {shouldShowList && (
                <SearchAutocompleteList
                    autocompleteQueryValue={autocompleteQueryValue || textInputValue}
                    handleSearch={searchInServer}
                    searchQueryItem={searchQueryItem}
                    getAdditionalSections={getAdditionalSections}
                    onListItemPress={onListItemPress}
                    setTextQuery={setTextAndUpdateSelection}
                    updateAutocompleteSubstitutions={updateAutocompleteSubstitutions}
                    onHighlightFirstItem={updateAndScrollToFocusedIndex}
                    ref={listRef}
                    textInputRef={textInputRef}
                    personalDetails={personalDetails}
                    reports={reports}
                    allFeeds={allFeeds}
                    allCards={allCards}
                />
            )}
            {!shouldShowList && (
                <OptionsListSkeletonView
                    fixedNumItems={4}
                    shouldStyleAsTable
                    speed={CONST.TIMING.SKELETON_ANIMATION_SPEED}
                />
            )}
        </View>
    );
}

export default SearchRouter;
