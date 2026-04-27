import {hasSeenTourSelector} from '@selectors/Onboarding';
import {deepEqual} from 'fast-equals';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {TextInputProps} from 'react-native';
import {InteractionManager, View} from 'react-native';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import DeferredAutocompleteList from '@components/Search/DeferredSearchAutocompleteList';
import type {GetAdditionalSectionsCallback} from '@components/Search/SearchAutocompleteList';
import {useSearchActionsContext} from '@components/Search/SearchContext';
import SearchInputSelectionWrapper from '@components/Search/SearchInputSelectionWrapper';
import type {SearchQueryItem} from '@components/Search/SearchList/ListItem/SearchQueryListItem';
import {isSearchQueryItem} from '@components/Search/SearchList/ListItem/SearchQueryListItem';
import type {SearchQueryString} from '@components/Search/types';
import type {SelectionListWithSectionsHandle} from '@components/SelectionList/SelectionListWithSections/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useThemeStyles from '@hooks/useThemeStyles';
import {scrollToRight} from '@libs/InputUtils';
import backHistory from '@libs/Navigation/helpers/backHistory';
import type {SearchOption} from '@libs/OptionsListUtils';
import {createOptionFromReport} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import {getReportAction} from '@libs/ReportActionsUtils';
import {getReportOrDraftReport} from '@libs/ReportUtils';
import type {OptionData} from '@libs/ReportUtils';
import {getAutocompleteQueryWithComma, getTrimmedUserSearchQueryPreservingComma} from '@libs/SearchAutocompleteUtils';
import {getQueryWithUpdatedValues, sanitizeSearchValue} from '@libs/SearchQueryUtils';
import StringUtils from '@libs/StringUtils';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import {navigateToAndOpenReport, searchInServer} from '@userActions/Report';
import {setSearchContext} from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type Report from '@src/types/onyx/Report';
import type {SubstitutionMap} from './getQueryWithSubstitutions';
import {getQueryWithSubstitutions} from './getQueryWithSubstitutions';
import {getUpdatedSubstitutionsMap} from './getUpdatedSubstitutionsMap';
import {getContextualReportData, getContextualSearchAutocompleteKey, getContextualSearchQuery} from './SearchRouterUtils';
import updateAutocompleteSubstitutionsForSelection from './updateAutocompleteSubstitutionsForSelection';

const privateIsArchivedSelector = (nvp: {private_isArchived?: string} | undefined): boolean | undefined => !!nvp?.private_isArchived;

type SearchRouterProps = {
    onRouterClose: () => void;
    shouldHideInputCaret?: TextInputProps['caretHidden'];
    isSearchRouterDisplayed?: boolean;
    ref?: React.Ref<View>;
};

function SearchRouter({onRouterClose, shouldHideInputCaret, isSearchRouterDisplayed, ref}: SearchRouterProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {setShouldResetSearchQuery} = useSearchActionsContext();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails.accountID;
    const [isSearchingForReports] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const personalDetails = usePersonalDetails();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const listRef = useRef<SelectionListWithSectionsHandle>(null);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MagnifyingGlass']);

    // The actual input text that the user sees
    const [textInputValue, , setTextInputValue] = useDebouncedState('', 500);
    // The input text that was last used for autocomplete; needed for the SearchAutocompleteList when browsing list via arrow keys
    const [autocompleteQueryValue, setAutocompleteQueryValue] = useState(textInputValue);
    const [selection, setSelection] = useState({start: textInputValue.length, end: textInputValue.length});
    const [autocompleteSubstitutions, setAutocompleteSubstitutions] = useState<SubstitutionMap>({});
    const textInputRef = useRef<AnimatedTextInputRef>(null);

    const {contextualReportID, isSearchRouterScreen} = useRootNavigationState(getContextualReportData);

    const [contextualReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${contextualReportID}`);
    const [contextualReportNVP] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${contextualReportID}`, {
        selector: privateIsArchivedSelector,
    });
    const [contextualReportPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${contextualReport?.policyID}`);

    const contextualPoliciesMap = (() => {
        if (!contextualReport?.policyID || !contextualReportPolicy) {
            return {};
        }
        const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${contextualReport.policyID}`;
        return {[policyKey]: contextualReportPolicy};
    })();

    const contextualReportsMap = (() => {
        if (!contextualReportID || !contextualReport) {
            return {};
        }
        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${contextualReportID}`;
        return {[reportKey]: contextualReport};
    })();

    const getAdditionalSections: GetAdditionalSectionsCallback = useCallback(
        ({recentReports}, sectionIndex) => {
            if (!contextualReportID) {
                return undefined;
            }

            // We will only show the contextual search suggestion if the user has not typed anything
            if (textInputValue) {
                return undefined;
            }

            if (!isSearchRouterDisplayed && !isSearchRouterScreen) {
                return undefined;
            }
            let reportForContextualSearch = recentReports.find((option) => option.reportID === contextualReportID);
            const reportForContextualSearchReport = getReportOrDraftReport(reportForContextualSearch?.reportID);
            const reportAction = getReportAction(reportForContextualSearchReport?.parentReportID, reportForContextualSearchReport?.parentReportActionID);
            const shouldParserToHTML = reportAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT;
            if (!reportForContextualSearch) {
                if (!contextualReport) {
                    return undefined;
                }

                const option = createOptionFromReport(contextualReport, personalDetails, contextualReportNVP, contextualReportPolicy, undefined, {
                    showPersonalDetails: true,
                });
                reportForContextualSearch = option;
            }

            const reportQueryValue = reportForContextualSearch.text ?? reportForContextualSearch.alternateText ?? reportForContextualSearch.reportID;

            let roomType: ValueOf<typeof CONST.SEARCH.DATA_TYPES> = CONST.SEARCH.DATA_TYPES.CHAT;
            let autocompleteID: string | undefined = reportForContextualSearch.reportID;

            if (reportForContextualSearch.isInvoiceRoom) {
                roomType = CONST.SEARCH.DATA_TYPES.INVOICE;
                const report = reportForContextualSearch as SearchOption<Report>;
                if (report.item?.invoiceReceiver && report.item.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL) {
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
                    sectionIndex,
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
        [
            contextualReportID,
            textInputValue,
            isSearchRouterDisplayed,
            isSearchRouterScreen,
            translate,
            expensifyIcons.MagnifyingGlass,
            styles.activeComponentBG,
            contextualReport,
            personalDetails,
            contextualReportNVP,
            contextualReportPolicy,
        ],
    );

    const searchQueryItem = textInputValue
        ? {
              text: textInputValue,
              singleIcon: expensifyIcons.MagnifyingGlass,
              searchQuery: textInputValue,
              itemStyle: styles.activeComponentBG,
              keyForList: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.FIND_ITEM,
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

    const onListItemPress = useCallback(
        (item: OptionData | SearchQueryItem) => {
            const setFocusAndScrollToRight = () => {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                InteractionManager.runAfterInteractions(() => {
                    if (!textInputRef.current) {
                        return;
                    }
                    textInputRef.current.focus();
                    scrollToRight(textInputRef.current);
                });
            };

            if (isSearchQueryItem(item)) {
                if (!item.searchQuery) {
                    return;
                }

                if (item.searchItemType === CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.CONTEXTUAL_SUGGESTION) {
                    const searchQuery = getContextualSearchQuery(item, contextualPoliciesMap, contextualReportsMap);
                    const newSearchQuery = `${searchQuery}\u00A0`;
                    onSearchQueryChange(newSearchQuery, true);
                    setSelection({start: newSearchQuery.length, end: newSearchQuery.length});

                    const autocompleteKey = getContextualSearchAutocompleteKey(item, contextualPoliciesMap, contextualReportsMap);
                    if (autocompleteKey && item.autocompleteID) {
                        const substitutions = {...autocompleteSubstitutions, [autocompleteKey]: item.autocompleteID};
                        setAutocompleteSubstitutions(substitutions);
                    }
                    setFocusAndScrollToRight();
                } else if (item.searchItemType === CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.AUTOCOMPLETE_SUGGESTION && textInputValue) {
                    const fieldKey = item.mapKey?.includes(':') ? item.mapKey.split(':').at(0) : item.mapKey;
                    const trimmedUserSearchQuery = getTrimmedUserSearchQueryPreservingComma(textInputValue, fieldKey);
                    const newSearchQuery = `${trimmedUserSearchQuery}${sanitizeSearchValue(item.searchQuery)}\u00A0`;
                    onSearchQueryChange(newSearchQuery, true);
                    setSelection({start: newSearchQuery.length, end: newSearchQuery.length});

                    updateAutocompleteSubstitutionsForSelection({
                        newSearchQuery,
                        fieldKey,
                        mapKey: item.mapKey,
                        searchQuery: item.searchQuery,
                        autocompleteID: item.autocompleteID,
                        substitutions: autocompleteSubstitutions,
                        setAutocompleteSubstitutions,
                    });
                    setFocusAndScrollToRight();
                } else {
                    submitSearch(item.searchQuery, item.keyForList !== CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.FIND_ITEM);
                }
            } else {
                backHistory(() => {
                    if (item?.reportID) {
                        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(item.reportID));
                    } else if ('login' in item) {
                        navigateToAndOpenReport(item.login ? [item.login] : [], personalDetails, currentUserAccountID, introSelected, isSelfTourViewed, betas, false);
                    }
                });
                onRouterClose();
            }
        },
        [
            autocompleteSubstitutions,
            onRouterClose,
            personalDetails,
            onSearchQueryChange,
            submitSearch,
            textInputValue,
            currentUserAccountID,
            introSelected,
            isSelfTourViewed,
            betas,
            contextualPoliciesMap,
            contextualReportsMap,
        ],
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
                        const focusedOption = listRef.current?.getFocusedOption?.();

                        if (!focusedOption) {
                            submitSearch(textInputValue);
                            return;
                        }

                        onListItemPress(focusedOption);
                    }}
                    caretHidden={shouldHideInputCaret}
                    shouldShowOfflineMessage
                    wrapperStyle={styles.searchRouterBorder}
                    wrapperFocusedStyle={styles.borderColorFocus}
                    isSearchingForReports={!!isSearchingForReports}
                    selection={selection}
                    substitutionMap={autocompleteSubstitutions}
                    ref={textInputRef}
                    shouldDelayFocus
                />
            </View>
            <DeferredAutocompleteList
                autocompleteQueryValue={autocompleteQueryValue || textInputValue}
                handleSearch={searchInServer}
                searchQueryItem={searchQueryItem}
                getAdditionalSections={getAdditionalSections}
                onListItemPress={onListItemPress}
                onHighlightFirstItem={updateAndScrollToFocusedIndex}
                ref={listRef}
                textInputRef={textInputRef}
                autocompleteSubstitutions={autocompleteSubstitutions}
            />
        </View>
    );
}

export default SearchRouter;
