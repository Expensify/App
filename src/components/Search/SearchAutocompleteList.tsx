import {usePersonalDetails} from '@components/OnyxListItemProvider';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import BareUserListItem from '@components/SelectionList/ListItem/BareUserListItem';
import type {ListItem as NewListItem, UserListItemProps} from '@components/SelectionList/ListItem/types';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {Section, SelectionListWithSectionsHandle} from '@components/SelectionList/SelectionListWithSections/types';

import useAutocompleteSuggestions from '@hooks/useAutocompleteSuggestions';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebounce from '@hooks/useDebounce';
import useDebouncedAccessibilityAnnouncement from '@hooks/useDebouncedAccessibilityAnnouncement';
import useFeedKeysWithAssignedCards from '@hooks/useFeedKeysWithAssignedCards';
import useFilteredOptions from '@hooks/useFilteredOptions';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSortedActions from '@hooks/useSortedActions';
import useThemeStyles from '@hooks/useThemeStyles';

import FS from '@libs/Fullstory';
import type {Options, SearchOption} from '@libs/OptionsListUtils';
import {combineOrderingOfReportsAndPersonalDetails, createOptionFromReport, getSearchOptions} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {getReportAction} from '@libs/ReportActionsUtils';
import type {OptionData} from '@libs/ReportUtils';
import {getReportOrDraftReport} from '@libs/ReportUtils';
import {buildSearchQueryJSON, buildUserReadableQueryString, getQueryWithoutFilters, shouldHighlight} from '@libs/SearchQueryUtils';
import StringUtils from '@libs/StringUtils';
import {cancelSpan, endSpan, getSpan} from '@libs/telemetry/activeSpans';
import {expensifyLoginsSelector} from '@libs/UserUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {ForwardedRef, RefObject} from 'react';
import type {OnyxCollection} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React, {useEffect, useMemo, useRef, useState} from 'react';

import type {SearchQueryItem, SearchQueryListItemProps} from './SearchList/ListItem/SearchQueryListItem';
import type {SubstitutionMap} from './SearchRouter/getQueryWithSubstitutions';
import type {UserFriendlyKey} from './types';

import getAutocompleteInitialFocus from './getAutocompleteInitialFocus';
import AvatarWithTextCell from './SearchList/ListItem/AvatarWithTextCell';
import SearchQueryListItem, {isSearchQueryItem} from './SearchList/ListItem/SearchQueryListItem';
import {getSubstitutionMapKey} from './SearchRouter/getQueryWithSubstitutions';
import SEARCH_ROUTER_OPTIONS_CONFIG from './SearchRouter/searchRouterOptionsConfig';

type AutocompleteListItem = NewListItem & Partial<Omit<OptionData, keyof NewListItem>> & Partial<Omit<SearchQueryItem, keyof NewListItem>>;

type GetAdditionalSectionsCallback = (options: Options, sectionIndex: number) => Array<Section<AutocompleteListItem>> | undefined;

type SearchAutocompleteListProps = {
    /** Value of TextInput */
    autocompleteQueryValue: string;

    /** Immediate (non-debounced) query from the input for UI-only behavior */
    inputQueryValue?: string;

    /** Callback to trigger search action * */
    handleSearch: (value: string) => void;

    /** Optional items to always display at the top of the router list */
    searchQueryItems?: SearchQueryItem[];

    /** Any extra sections that should be displayed in the router list. */
    getAdditionalSections?: GetAdditionalSectionsCallback;

    /** Callback to call when an item is clicked/selected */
    onListItemPress: (item: OptionData | SearchQueryItem) => void;

    /** Whether to subscribe to KeyboardShortcut arrow keys events */
    shouldSubscribeToArrowKeyEvents?: boolean;

    /** Whether to highlight the first matched result so Enter selects it. Only the SearchRouter (Cmd+K) uses this;
     *  the search page input keeps focus on the search-query row to match production behavior. */
    shouldHighlightFirstItem?: boolean;

    /** Ref for the external text input */
    textInputRef?: RefObject<AnimatedTextInputRef | null>;

    /** Map of display values to actual IDs for filters (e.g. workspace name -> policy ID). Used to exclude by ID when multiple options share the same name. */
    autocompleteSubstitutions?: SubstitutionMap;
    /** Reference to the outer element */
    ref?: ForwardedRef<SelectionListWithSectionsHandle>;
};

const defaultListOptions = {
    userToInvite: null,
    recentReports: [],
    personalDetails: [],
    currentUserOption: null,
    categoryOptions: [],
};

const emptyOptionList = {
    reports: [],
    personalDetails: [],
};

const setPerformanceTimersEnd = () => {
    endSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER);
};

function isSearchQueryListItem(listItem: UserListItemProps<AutocompleteListItem> | SearchQueryListItemProps): listItem is SearchQueryListItemProps {
    return isSearchQueryItem(listItem.item);
}

function getAutocompleteDisplayText(filterKey: UserFriendlyKey, value: string) {
    return `${filterKey}:${value}`;
}

function SearchRouterItem(props: UserListItemProps<AutocompleteListItem> | SearchQueryListItemProps) {
    const styles = useThemeStyles();

    if (isSearchQueryListItem(props)) {
        return <SearchQueryListItem {...props} />;
    }

    const {item, isFocused, showTooltip, isDisabled, onSelectRow, onDismissError, shouldPreventEnterKeySubmit, rightHandSideComponent, onFocus, shouldSyncFocus, wrapperStyle} = props;
    const fsClass = FS.getChatFSClass((item as SearchOption<Report> | undefined)?.item);

    return (
        <BareUserListItem
            item={item}
            keyForList={item.keyForList}
            isFocused={isFocused}
            showTooltip={showTooltip}
            isDisabled={isDisabled}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit}
            rightHandSideComponent={rightHandSideComponent}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            wrapperStyle={wrapperStyle}
            pressableStyle={[styles.br2, styles.ph3]}
            forwardedFSClass={fsClass}
            shouldHighlightSelectedItem
        />
    );
}

function SearchAutocompleteList({
    autocompleteQueryValue,
    inputQueryValue,
    handleSearch,
    searchQueryItems,
    getAdditionalSections,
    onListItemPress,
    shouldSubscribeToArrowKeyEvents = true,
    shouldHighlightFirstItem = false,
    textInputRef,
    autocompleteSubstitutions,
    ref,
}: SearchAutocompleteListProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare, formatPhoneNumber, dateFnsLocale} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const contentContainerStyle = useBottomSafeSafeAreaPaddingStyle({
        addOfflineIndicatorBottomSafeAreaPadding: true,
        style: styles.pb2,
    });

    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const feedKeysWithCards = useFeedKeysWithAssignedCards();
    const reportAttributes = useReportAttributes();
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT);
    const [recentSearches, recentSearchesMetadata] = useOnyx(ONYXKEYS.RECENT_SEARCHES);
    const [countryCode] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [loginList] = useOnyx(ONYXKEYS.LOGINS, {selector: expensifyLoginsSelector});
    const [policies = getEmptyObject<NonNullable<OnyxCollection<Policy>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS);
    const sortedActions = useSortedActions();
    const personalDetails = usePersonalDetails();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [personalAndWorkspaceCards] = useOnyx(ONYXKEYS.DERIVED.PERSONAL_AND_WORKSPACE_CARD_LIST);
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const allCards = personalAndWorkspaceCards ?? CONST.EMPTY_OBJECT;
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [searchResultReportIDs] = useOnyx(ONYXKEYS.RAM_ONLY_SEARCH_RESULT_REPORT_IDS);
    const effectiveInputQueryValue = inputQueryValue ?? autocompleteQueryValue;
    const hasEffectiveInputQuery = effectiveInputQueryValue.trim() !== '';
    // hasEffectiveInputQuery reflects the immediate input (used to hide recent searches the moment the user types).
    // hasActiveSearchResults additionally requires the debounced autocompleteQueryValue to be non-empty, i.e. the
    // filtered searchOptions/recentReportsOptions actually reflect the typed query. Gating the results layout on this
    // (rather than the immediate value) keeps the sections in sync with the data they render: during the debounce
    // window we keep showing recent chats instead of briefly rendering the previous/unfiltered rows under the search
    // layout and then reflowing once the debounced query catches up.
    const hasActiveSearchResults = hasEffectiveInputQuery && autocompleteQueryValue.trim() !== '';
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserEmail = currentUserPersonalDetails.email ?? '';
    const currentUserAccountID = currentUserPersonalDetails.accountID;
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['History', 'MagnifyingGlass']);
    const taxRates = useMemo(() => getAllTaxRates(policies), [policies]);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

    const {
        options: listOptions,
        isLoading: isLoadingOptions,
        loadAll: loadAllRecentReports,
        hasMore: hasMoreRecentReports,
    } = useFilteredOptions({
        ...SEARCH_ROUTER_OPTIONS_CONFIG,
        isSearching: !!autocompleteQueryValue.trim(),
    });

    const isRecentSearchesDataLoaded = !isLoadingOnyxValue(recentSearchesMetadata);

    useEffect(() => {
        return () => {
            cancelSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_LIST_RENDER);
        };
    }, []);

    const coldStartAttributeSet = useRef(false);
    useEffect(() => {
        if (coldStartAttributeSet.current) {
            return;
        }
        const parentSpan = getSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER);
        if (parentSpan) {
            parentSpan.setAttribute(CONST.TELEMETRY.ATTRIBUTE_COLD_START, isLoadingOptions);
            coldStartAttributeSet.current = true;
        }
    }, [isLoadingOptions]);

    const searchOptions = useMemo(() => {
        if (listOptions === null) {
            return defaultListOptions;
        }
        return getSearchOptions({
            dateFnsLocale,
            options: listOptions,
            draftComments,
            betas: betas ?? [],
            isUsedInChatFinder: true,
            includeReadOnly: true,
            searchQuery: autocompleteQueryValue,
            maxResults: searchResultReportIDs && searchResultReportIDs.length > 0 ? listOptions.reports.length : CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS,
            includeUserToInvite: true,
            includeRecentReports: true,
            includeCurrentUser: true,
            countryCode,
            shouldShowGBR: false,
            shouldUnreadBeBold: true,
            loginList,
            visibleReportActionsData,
            currentUserAccountID,
            currentUserEmail,
            policyCollection: policies,
            personalDetails,
            sortedActions,
            conciergeReportID,
            isTrackIntentUser,
            translate,
        }).options;
    }, [
        listOptions,
        draftComments,
        betas,
        autocompleteQueryValue,
        countryCode,
        loginList,
        visibleReportActionsData,
        currentUserAccountID,
        currentUserEmail,
        policies,
        personalDetails,
        sortedActions,
        conciergeReportID,
        isTrackIntentUser,
        searchResultReportIDs,
        translate,
        dateFnsLocale,
    ]);

    const [isInitialRender, setIsInitialRender] = useState(true);
    const prevQueryRef = useRef(effectiveInputQueryValue);
    const innerListRef = useRef<SelectionListWithSectionsHandle | null>(null);
    const hasSetInitialFocusRef = useRef(false);
    // Tracks the row key we last focused programmatically (reset-to-top below), so the auto-highlight
    // effect can tell whether the user has since navigated away with the arrow keys. Without this,
    // auto-highlight would silently snap focus back once the debounce settles even if the user had
    // already moved to a different row (e.g. Ask Concierge) in the meantime.
    const lastProgrammaticFocusKeyRef = useRef<string | undefined>(undefined);

    // Callback ref to set both inner ref and forward to external ref
    const setListRef = (instance: SelectionListWithSectionsHandle | null) => {
        innerListRef.current = instance;
        if (typeof ref === 'function') {
            ref(instance);
        } else if (ref) {
            // Forwarded ref requires mutation when ref is an object ref (not a callback)
            // eslint-disable-next-line no-param-reassign
            ref.current = instance;
        }
    };

    // Track external text input focus to prevent list items from stealing focus while typing
    useEffect(() => {
        if (!textInputRef?.current) {
            return;
        }

        // Update the list's internal focus tracking when the external input focus changes
        const updateFocus = () => {
            innerListRef.current?.updateExternalTextInputFocus(textInputRef.current?.isFocused() ?? false);
        };

        // Initial update
        updateFocus();

        // Note: We can't easily subscribe to focus/blur events on the ref, so we update on query changes
        // which happen when the user types (meaning input is focused)
    }, [textInputRef, effectiveInputQueryValue]);

    const autocompleteSuggestions = useAutocompleteSuggestions({
        autocompleteQueryValue,
        allCards,
        allFeeds,
        options: listOptions ?? emptyOptionList,
        draftComments,
        betas,
        countryCode,
        loginList,
        policies,
        visibleReportActionsData,
        currentUserAccountID,
        currentUserEmail,
        personalDetails,
        feedKeysWithCards,
        translate,
        autocompleteSubstitutions,
    });

    const autocompleteQueryWithoutFilters = getQueryWithoutFilters(autocompleteQueryValue);

    const recentSearchesData = useMemo(() => {
        const sortedRecentSearches = Object.entries(recentSearches ?? {}).sort(([, firstRecentSearch], [, secondRecentSearch]) =>
            localeCompare(secondRecentSearch.timestamp, firstRecentSearch.timestamp),
        );

        return sortedRecentSearches.slice(0, 5).map(([recentSearchHash, {query}]) => {
            const searchQueryJSON = buildSearchQueryJSON(query);
            return {
                text: searchQueryJSON
                    ? buildUserReadableQueryString({
                          queryJSON: searchQueryJSON,
                          PersonalDetails: personalDetails,
                          reports,
                          taxRates,
                          cardList: allCards,
                          cardFeeds: allFeeds,
                          policies,
                          currentUserAccountID,
                          autoCompleteWithSpace: false,
                          translate,
                          formatPhoneNumber,
                          feedKeysWithCards,
                          reportAttributes,
                          bankAccountList,
                      })
                    : query,
                singleIcon: expensifyIcons.History,
                searchQuery: query,
                keyForList: recentSearchHash,
                searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.SEARCH,
            };
        });
    }, [
        recentSearches,
        localeCompare,
        personalDetails,
        reports,
        taxRates,
        allCards,
        allFeeds,
        policies,
        currentUserAccountID,
        translate,
        formatPhoneNumber,
        feedKeysWithCards,
        reportAttributes,
        bankAccountList,
        expensifyIcons.History,
    ]);

    const recentReportsOptions = useMemo(() => {
        if (!hasActiveSearchResults) {
            return searchOptions.recentReports;
        }

        // searchOptions/autocompleteQueryValue are debounced. For a query -> query change this still returns the
        // previous query's matches during the debounce window (rows stay visible, preserving focus/Enter/arrow keys).
        // For the empty -> query transition hasActiveSearchResults is false until the debounced query lands, so this
        // returns recent chats instead of unfiltered rows, avoiding the stale-then-filtered reflow.
        const orderedOptions = combineOrderingOfReportsAndPersonalDetails(searchOptions, autocompleteQueryValue, {
            sortByReportTypeInSearch: true,
            preferChatRoomsOverThreads: true,
        });

        const reportOptions: OptionData[] = [...orderedOptions.recentReports, ...orderedOptions.personalDetails];
        if (searchOptions.userToInvite) {
            reportOptions.push(searchOptions.userToInvite);
        }

        if (searchResultReportIDs && searchResultReportIDs.length > 0) {
            // The server can match a report on things the client-side matcher never checks (e.g. you own the
            // report, not just that a participant's name matches). Add any server-confirmed report the
            // client-side matcher missed, built straight from Onyx, so a real match is never silently dropped
            // and backfilled with a lower-quality local guess.
            const matchedReportIDs = new Set(reportOptions.map((option) => option.reportID).filter(Boolean));
            for (const reportID of searchResultReportIDs) {
                if (matchedReportIDs.has(reportID)) {
                    continue;
                }
                const report = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
                if (!report) {
                    continue;
                }
                reportOptions.push(
                    createOptionFromReport({
                        dateFnsLocale,
                        report,
                        personalDetails,
                        privateIsArchived: undefined,
                        policy: policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`],
                        sortedActions,
                        conciergeReportID,
                        visibleReportActionsData,
                        isTrackIntentUser,
                    }),
                );
                matchedReportIDs.add(reportID);
            }

            const rankByReportID = new Map(searchResultReportIDs.map((reportID, index) => [reportID, index]));
            const rankOf = (option: OptionData) => {
                if (option.isSelfDM) {
                    return -1;
                }
                return option.reportID === undefined ? Number.MAX_SAFE_INTEGER : (rankByReportID.get(option.reportID) ?? Number.MAX_SAFE_INTEGER);
            };
            reportOptions.sort((a, b) => rankOf(a) - rankOf(b));
        }

        return reportOptions.slice(0, 20);
    }, [
        autocompleteQueryValue,
        hasActiveSearchResults,
        searchOptions,
        searchResultReportIDs,
        reports,
        personalDetails,
        dateFnsLocale,
        policies,
        sortedActions,
        conciergeReportID,
        visibleReportActionsData,
        isTrackIntentUser,
    ]);

    // Callers that pass a distinct inputQueryValue (e.g. SearchRouter) already debounce autocompleteQueryValue
    // upstream, so firing handleSearch immediately here avoids stacking a second debounce on top and doubling
    // the delay. Callers that don't pass inputQueryValue (e.g. the Spend page header) still get the local
    // debounce below so they don't fire a server request on every keystroke.
    const hasUpstreamDebounce = inputQueryValue !== undefined;

    const debounceHandleSearch = useDebounce(() => {
        if (!handleSearch || !autocompleteQueryWithoutFilters) {
            return;
        }

        handleSearch(autocompleteQueryWithoutFilters);
    }, CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME);

    useEffect(() => {
        if (!handleSearch || !autocompleteQueryWithoutFilters) {
            return;
        }

        if (hasUpstreamDebounce) {
            handleSearch(autocompleteQueryWithoutFilters);
            return;
        }

        debounceHandleSearch();
    }, [autocompleteQueryWithoutFilters, debounceHandleSearch, handleSearch, hasUpstreamDebounce]);

    /* Sections generation */
    const {sections, styledRecentReports, suggestionsCount} = useMemo(() => {
        const nextSections: Array<Section<AutocompleteListItem>> = [];
        let sectionIndex = 0;
        let nextSuggestionsCount = 0;

        const pushSection = (section: Section<AutocompleteListItem>) => {
            nextSections.push(section);
            nextSuggestionsCount += section.data.filter((item) => item.keyForList !== CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.FIND_ITEM).length;
        };

        if (searchQueryItems && searchQueryItems.length > 0) {
            pushSection({data: searchQueryItems as AutocompleteListItem[], sectionIndex: sectionIndex++});
        }

        const additionalSections = getAdditionalSections?.(searchOptions, sectionIndex);

        if (additionalSections) {
            for (const section of additionalSections) {
                pushSection(section);
                sectionIndex++;
            }
        }

        if (!hasEffectiveInputQuery && recentSearchesData && recentSearchesData.length > 0) {
            pushSection({title: translate('search.recentSearches'), data: recentSearchesData as AutocompleteListItem[], sectionIndex: sectionIndex++});
        }

        const nextStyledRecentReports = recentReportsOptions.map((option) => {
            const report = getReportOrDraftReport(option.reportID, undefined, undefined, undefined, reports?.[`${ONYXKEYS.COLLECTION.REPORT}${option.reportID}`]);
            const reportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
            const shouldParserToHTML = !!reportAction && reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT;
            const keyForList = option.keyForList ?? option.reportID ?? (option.accountID ? String(option.accountID) : undefined);
            return {
                ...option,
                keyForList,
                pressableStyle: styles.br2,
                text: StringUtils.lineBreaksToSpaces(shouldParserToHTML ? Parser.htmlToText(option.text ?? '') : (option.text ?? '')),
                wrapperStyle: [styles.pr3, styles.pl3],
            } as AutocompleteListItem;
        });

        const skeletonHeader = (
            <OptionsListSkeletonView
                fixedNumItems={3}
                shouldStyleAsTable
                speed={CONST.TIMING.SKELETON_ANIMATION_SPEED}
            />
        );

        if (!hasActiveSearchResults) {
            // No active (debounced) query yet: single "Recent chats" section. This also covers the debounce window
            // right after the user starts typing, so we keep recent chats visible instead of flashing search rows.
            if (!isLoadingOptions) {
                pushSection({title: translate('search.recentChats'), data: nextStyledRecentReports, sectionIndex: sectionIndex++});
            } else {
                pushSection({
                    title: translate('search.recentChats'),
                    data: [],
                    sectionIndex: sectionIndex++,
                    customHeader: skeletonHeader,
                });
            }
        } else if (nextStyledRecentReports.length > 0 || !isLoadingOptions) {
            // Active search: render the results as a single list in the order recentReportsOptions provides.
            pushSection({title: translate('search.serverResults'), data: nextStyledRecentReports, sectionIndex: sectionIndex++});
        } else {
            pushSection({title: undefined, data: [], sectionIndex: sectionIndex++, customHeader: skeletonHeader});
        }

        if (autocompleteSuggestions.length > 0) {
            const autocompleteData: AutocompleteListItem[] = autocompleteSuggestions.map(({filterKey, text, autocompleteID, mapKey, workspaceIcon}) => {
                return {
                    text: getAutocompleteDisplayText(filterKey, text),
                    mapKey: mapKey ? getSubstitutionMapKey(mapKey, text) : undefined,
                    singleIcon: expensifyIcons.MagnifyingGlass,
                    searchQuery: text,
                    autocompleteID,
                    keyForList: autocompleteID ?? text, // in case we have a unique identifier then use it because text might not be unique
                    searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.AUTOCOMPLETE_SUGGESTION,
                    // For report-backed `in:` suggestions, show the owning workspace on the right of the row so identically
                    // named rooms (e.g. #admins) in different workspaces can be told apart.
                    rightElement: workspaceIcon ? (
                        <AvatarWithTextCell
                            reportName={workspaceIcon.name}
                            icon={workspaceIcon}
                            textStyle={styles.textLabelSupporting}
                        />
                    ) : undefined,
                };
            });

            pushSection({title: translate('search.suggestions'), data: autocompleteData, sectionIndex: sectionIndex++});
        }

        return {sections: nextSections, styledRecentReports: nextStyledRecentReports, suggestionsCount: nextSuggestionsCount};
    }, [
        hasEffectiveInputQuery,
        hasActiveSearchResults,
        autocompleteSuggestions,
        expensifyIcons,
        getAdditionalSections,
        recentReportsOptions,
        recentSearchesData,
        searchOptions,
        searchQueryItems,
        styles,
        translate,
        isLoadingOptions,
        reports,
    ]);

    const trimmedAutocompleteQueryValue = autocompleteQueryValue.trim();

    // The list shows at most MAX_AMOUNT_OF_SUGGESTIONS recent reports. If the initial raw cap filters down
    // below that (e.g. many hidden/muted chats), expand to the full report set in one step so the remaining
    // slots fill from less-recent reports. This replaces scroll-driven loading: the list never paginates past
    // the visible cap, so there is nothing to load on scroll. Fires at most once: afterwards either the visible
    // cap is reached or hasMoreRecentReports is false.
    useEffect(() => {
        if (trimmedAutocompleteQueryValue !== '' || isLoadingOptions || recentReportsOptions.length >= CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS || !hasMoreRecentReports) {
            return;
        }
        loadAllRecentReports();
    }, [trimmedAutocompleteQueryValue, isLoadingOptions, recentReportsOptions.length, hasMoreRecentReports, loadAllRecentReports]);

    const isLoading = !isRecentSearchesDataLoaded;
    const suggestionsAnnouncement = suggestionsCount > 0 ? translate('search.suggestionsAvailable', {count: suggestionsCount}, trimmedAutocompleteQueryValue) : '';
    useDebouncedAccessibilityAnnouncement(suggestionsAnnouncement, !!suggestionsAnnouncement, autocompleteQueryValue);

    const noResultsFoundText = translate('common.noResultsFound');
    const shouldAnnounceNoResults = !isLoading && suggestionsCount === 0 && !!trimmedAutocompleteQueryValue;
    useDebouncedAccessibilityAnnouncement(noResultsFoundText, shouldAnnounceNoResults, autocompleteQueryValue);

    const recentReportKeys = new Set(styledRecentReports.map((report) => report.keyForList));
    const {firstRecentReportKey, firstRecentReportText, firstRecentReportFlatIndex, defaultFocusedKey, defaultFocusedFlatIndex} = getAutocompleteInitialFocus(sections, recentReportKeys);
    const normalizedReferenceText = firstRecentReportText.toLowerCase();

    // Stable across renders while the query is non-empty (searchQueryItems is a fresh array reference on every
    // SearchRouter render since it isn't memoized there, but its first item's key is always this same constant).
    // Depending on this value instead of the raw array keeps the effects below from re-running on every keystroke.
    const searchQueryRowKey = searchQueryItems?.at(0)?.keyForList;

    // Reset focus when query changes to prevent stale focus on wrong items.
    useEffect(() => {
        if (isInitialRender) {
            return;
        }

        const queryChanged = prevQueryRef.current !== effectiveInputQueryValue;
        prevQueryRef.current = effectiveInputQueryValue;

        if (!queryChanged) {
            return;
        }

        if (effectiveInputQueryValue === '') {
            // When query is cleared, reset the initial focus guard so the initial focus
            // effect can re-fire and correctly focus the first focusable item (skipping section headers).
            hasSetInitialFocusRef.current = false;
            return;
        }

        // autocompleteQueryValue (debounced) can already equal the freshly typed text the moment the query
        // changes, not just once it "catches up" later. This happens on a fast clear + retype of the exact same
        // text: clearing doesn't reset the debounce hook's internal value, so retyping the same text is a no-op
        // update and the debounced prop never changes again -- nothing would re-run the highlight effect below
        // afterward. Deciding the correct focus target here, synchronously from this render's own props (rather
        // than by reading the list's focus state back, which lags a render behind our own updates), is what
        // prevents focus from being left stranded on the search-query row in that case.
        const isDebounceSettled = autocompleteQueryValue.trim() === effectiveInputQueryValue.trim();
        if (isDebounceSettled && shouldHighlightFirstItem && firstRecentReportFlatIndex !== -1 && shouldHighlight(normalizedReferenceText, autocompleteQueryValue)) {
            lastProgrammaticFocusKeyRef.current = firstRecentReportKey;
            innerListRef.current?.updateAndScrollToFocusedIndex(firstRecentReportFlatIndex, true);
            return;
        }

        // The debounce hasn't caught up yet for this keystroke. If focus is already resting on the match from a
        // previous, already-settled keystroke, and the freshly typed text still matches that same row, keep focus
        // there instead of bouncing to the query row and waiting out a fresh debounce window -- this is what
        // prevents a visible flicker when continuing to type past an already-highlighted match (production has no
        // debounce gap here, so it never loses the highlight in this case either).
        if (
            shouldHighlightFirstItem &&
            firstRecentReportFlatIndex !== -1 &&
            lastProgrammaticFocusKeyRef.current === firstRecentReportKey &&
            shouldHighlight(normalizedReferenceText, effectiveInputQueryValue)
        ) {
            return;
        }

        // Otherwise the debounce is still pending and the match is no longer valid for this keystroke: focus the
        // search query item (index 0) and scroll to top. The highlight effect below switches focus to the first
        // result once a good match settles.
        lastProgrammaticFocusKeyRef.current = searchQueryRowKey;
        innerListRef.current?.updateAndScrollToFocusedIndex(0, true);
    }, [
        autocompleteQueryValue,
        effectiveInputQueryValue,
        firstRecentReportFlatIndex,
        firstRecentReportKey,
        isInitialRender,
        normalizedReferenceText,
        searchQueryRowKey,
        shouldHighlightFirstItem,
    ]);

    // When options initialize after the list is already mounted, initiallyFocusedItemKey has no effect
    // because useState(initialFocusedIndex) in useArrowKeyFocusManager only reads the initial value.
    // Imperatively focus the default row once options become available (desktop only).
    useEffect(() => {
        if (shouldUseNarrowLayout || isLoadingOptions || hasSetInitialFocusRef.current || defaultFocusedFlatIndex === -1) {
            return;
        }
        hasSetInitialFocusRef.current = true;

        // Track whatever we actually focused (the contextual "Search in <chat>" suggestion when present, else the
        // first recent report) so the auto-highlight effect below can tell whether the user has since navigated
        // away, versus us having landed on a row other than firstRecentReportKey to begin with.
        lastProgrammaticFocusKeyRef.current = defaultFocusedKey;
        innerListRef.current?.updateAndScrollToFocusedIndex(defaultFocusedFlatIndex, false);
    }, [isLoadingOptions, defaultFocusedFlatIndex, defaultFocusedKey, shouldUseNarrowLayout]);

    useEffect(() => {
        if (!shouldHighlightFirstItem || firstRecentReportFlatIndex === -1 || !shouldHighlight(normalizedReferenceText, autocompleteQueryValue)) {
            return;
        }

        // Only suppress the auto-highlight when the user has manually moved focus to some *other* real row
        // (e.g. arrow-keyed to Ask Concierge). The reset effect above always keeps lastProgrammaticFocusKeyRef in
        // sync with wherever it last placed focus (the search-query row while unsettled, or the first result once
        // settled), so comparing against it alone is enough to detect a real, user-initiated divergence -- this
        // effect is what promotes focus onto the first result once the debounce genuinely settles *later*, the
        // common, non-coalesced typing flow.
        const currentFocusedKey = innerListRef.current?.getFocusedOption?.()?.keyForList;
        const isOnProgrammaticTarget = lastProgrammaticFocusKeyRef.current === undefined || currentFocusedKey === lastProgrammaticFocusKeyRef.current;
        if (!isOnProgrammaticTarget) {
            return;
        }

        // Focus the header-aware flat index of the first result. A fixed index (e.g. searchQueryItems.length)
        // lands on the "Recent chats" section header row after the two-section switcher was introduced.
        lastProgrammaticFocusKeyRef.current = firstRecentReportKey;
        innerListRef.current?.updateAndScrollToFocusedIndex(firstRecentReportFlatIndex, true);
    }, [autocompleteQueryValue, firstRecentReportFlatIndex, firstRecentReportKey, normalizedReferenceText, shouldHighlightFirstItem]);

    if (isLoading) {
        return (
            <OptionsListSkeletonView
                fixedNumItems={4}
                shouldStyleAsTable
                speed={CONST.TIMING.SKELETON_ANIMATION_SPEED}
            />
        );
    }

    return (
        <SelectionListWithSections<AutocompleteListItem>
            shouldShowLoadingPlaceholder
            sections={sections}
            onSelectRow={onListItemPress}
            ListItem={SearchRouterItem}
            style={{
                containerStyle: [styles.mh100],
                listStyle: [styles.ph2, styles.overscrollBehaviorContain],
                contentContainerStyle,
                listItemWrapperStyle: [styles.pr0, styles.pl0],
                sectionTitleStyles: styles.mhn2,
            }}
            shouldSingleExecuteRowSelect
            ref={setListRef}
            initialScrollIndex={0}
            initiallyFocusedItemKey={!shouldUseNarrowLayout ? defaultFocusedKey : undefined}
            shouldHighlightInitiallyFocusedItem={!shouldUseNarrowLayout}
            shouldScrollToFocusedIndex={!isInitialRender}
            disableKeyboardShortcuts={!shouldSubscribeToArrowKeyEvents}
            addBottomSafeAreaPadding
            onLayout={() => {
                endSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_LIST_RENDER);
                setPerformanceTimersEnd();
                setIsInitialRender(false);
                innerListRef.current?.updateExternalTextInputFocus(textInputRef?.current?.isFocused() ?? false);
            }}
        />
    );
}

SearchAutocompleteList.displayName = 'SearchAutocompleteList';

export default React.memo(SearchAutocompleteList);
export {SearchRouterItem};
export type {GetAdditionalSectionsCallback, SearchAutocompleteListProps};
