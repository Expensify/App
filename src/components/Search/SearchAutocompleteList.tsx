import type {ForwardedRef, RefObject} from 'react';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import type {ListItem as NewListItem, UserListItemProps} from '@components/SelectionList/ListItem/types';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {Section, SelectionListWithSectionsHandle} from '@components/SelectionList/SelectionListWithSections/types';
import useAutocompleteSuggestions from '@hooks/useAutocompleteSuggestions';
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
import {combineOrderingOfReportsAndPersonalDetails, getSearchOptions} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {getReportAction} from '@libs/ReportActionsUtils';
import type {OptionData} from '@libs/ReportUtils';
import {formatReportLastMessageText, getReportOrDraftReport, getReportSubtitlePrefix} from '@libs/ReportUtils';
import {buildSearchQueryJSON, buildUserReadableQueryString, getQueryWithoutFilters, shouldHighlight} from '@libs/SearchQueryUtils';
import StringUtils from '@libs/StringUtils';
import {cancelSpan, endSpan, getSpan} from '@libs/telemetry/activeSpans';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import type {SearchQueryItem, SearchQueryListItemProps} from './SearchList/ListItem/SearchQueryListItem';
import SearchQueryListItem, {isSearchQueryItem} from './SearchList/ListItem/SearchQueryListItem';
import type {SubstitutionMap} from './SearchRouter/getQueryWithSubstitutions';
import {getSubstitutionMapKey} from './SearchRouter/getQueryWithSubstitutions';
import type {UserFriendlyKey} from './types';

type AutocompleteListItem = NewListItem & Partial<Omit<OptionData, keyof NewListItem>> & Partial<Omit<SearchQueryItem, keyof NewListItem>>;

type GetAdditionalSectionsCallback = (options: Options, sectionIndex: number) => Array<Section<AutocompleteListItem>> | undefined;

type SearchAutocompleteListProps = {
    /** Value of TextInput */
    autocompleteQueryValue: string;

    /** Callback to trigger search action * */
    handleSearch: (value: string) => void;

    /** An optional item to always display on the top of the router list  */
    searchQueryItem?: SearchQueryItem;

    /** Any extra sections that should be displayed in the router list. */
    getAdditionalSections?: GetAdditionalSectionsCallback;

    /** Callback to call when an item is clicked/selected */
    onListItemPress: (item: OptionData | SearchQueryItem) => void;

    /** Whether to subscribe to KeyboardShortcut arrow keys events */
    shouldSubscribeToArrowKeyEvents?: boolean;

    /** Callback to highlight (e.g. scroll to) the first matched item in the list. */
    onHighlightFirstItem?: () => void;

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
        return (
            <SearchQueryListItem
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        );
    }

    const fsClass = FS.getChatFSClass((props.item as SearchOption<Report> | undefined)?.item);

    return (
        <UserListItem
            pressableStyle={[styles.br2, styles.ph3]}
            forwardedFSClass={fsClass}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

function SearchAutocompleteList({
    autocompleteQueryValue,
    handleSearch,
    searchQueryItem,
    getAdditionalSections,
    onListItemPress,
    shouldSubscribeToArrowKeyEvents = true,
    onHighlightFirstItem,
    textInputRef,
    autocompleteSubstitutions,
    ref,
}: SearchAutocompleteListProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const feedKeysWithCards = useFeedKeysWithAssignedCards();
    const reportAttributes = useReportAttributes();
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT);
    const [nvpDismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING);
    const [recentSearches, recentSearchesMetadata] = useOnyx(ONYXKEYS.RECENT_SEARCHES);
    const [countryCode] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const [policies = getEmptyObject<NonNullable<OnyxCollection<Policy>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS);
    const sortedActions = useSortedActions();
    const personalDetails = usePersonalDetails();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [personalAndWorkspaceCards] = useOnyx(ONYXKEYS.DERIVED.PERSONAL_AND_WORKSPACE_CARD_LIST);
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const allCards = personalAndWorkspaceCards ?? CONST.EMPTY_OBJECT;
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserEmail = currentUserPersonalDetails.email ?? '';
    const currentUserAccountID = currentUserPersonalDetails.accountID;
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['History', 'MagnifyingGlass']);
    const taxRates = useMemo(() => getAllTaxRates(policies), [policies]);

    const {options: listOptions, isLoading: isLoadingOptions} = useFilteredOptions({enabled: true, isSearching: !!autocompleteQueryValue.trim(), betas: betas ?? []});

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
            options: listOptions,
            draftComments,
            nvpDismissedProductTraining,
            betas: betas ?? [],
            isUsedInChatFinder: true,
            includeReadOnly: true,
            searchQuery: autocompleteQueryValue,
            maxResults: CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS,
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
        });
    }, [
        listOptions,
        draftComments,
        nvpDismissedProductTraining,
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
    ]);

    const [isInitialRender, setIsInitialRender] = useState(true);
    const prevQueryRef = useRef(autocompleteQueryValue);
    const innerListRef = useRef<SelectionListWithSectionsHandle | null>(null);
    const hasSetInitialFocusRef = useRef(false);

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

    // Reset focus when query changes to prevent stale focus on wrong items
    useEffect(() => {
        if (isInitialRender) {
            return;
        }

        const queryChanged = prevQueryRef.current !== autocompleteQueryValue;
        prevQueryRef.current = autocompleteQueryValue;

        if (queryChanged) {
            if (autocompleteQueryValue === '') {
                // When query is cleared, reset the initial focus guard so the initial focus
                // effect can re-fire and correctly focus the first focusable item (skipping section headers).
                hasSetInitialFocusRef.current = false;
            } else {
                // When query changes to a non-empty value, focus on the search query item (index 0) and scroll to top
                // onHighlightFirstItem will switch focus to the first result when there's a good match
                innerListRef.current?.updateAndScrollToFocusedIndex(0, true);
            }
        }
    }, [autocompleteQueryValue, isInitialRender]);

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
    }, [textInputRef, autocompleteQueryValue]);

    const autocompleteSuggestions = useAutocompleteSuggestions({
        autocompleteQueryValue,
        allCards,
        allFeeds,
        options: listOptions ?? emptyOptionList,
        draftComments,
        nvpDismissedProductTraining,
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
                          feedKeysWithCards,
                          reportAttributes,
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
        feedKeysWithCards,
        reportAttributes,
        expensifyIcons.History,
    ]);

    const recentReportsOptions = useMemo(() => {
        if (autocompleteQueryValue.trim() === '') {
            return searchOptions.recentReports;
        }

        const orderedOptions = combineOrderingOfReportsAndPersonalDetails(searchOptions, autocompleteQueryValue, {
            sortByReportTypeInSearch: true,
            preferChatRoomsOverThreads: true,
        });

        const reportOptions: OptionData[] = [...orderedOptions.recentReports, ...orderedOptions.personalDetails];
        if (searchOptions.userToInvite) {
            reportOptions.push(searchOptions.userToInvite);
        }

        return reportOptions.slice(0, 20);
    }, [autocompleteQueryValue, searchOptions]);

    const debounceHandleSearch = useDebounce(() => {
        if (!handleSearch || !autocompleteQueryWithoutFilters) {
            return;
        }

        handleSearch(autocompleteQueryWithoutFilters);
    }, CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME);

    useEffect(() => {
        debounceHandleSearch();
    }, [autocompleteQueryWithoutFilters, debounceHandleSearch]);

    const reasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'SearchAutocompleteList',
        isRecentSearchesDataLoaded,
        isLoadingOptions,
    };

    /* Sections generation */
    const {sections, styledRecentReports, suggestionsCount} = useMemo(() => {
        const nextSections: Array<Section<AutocompleteListItem>> = [];
        let sectionIndex = 0;
        let nextSuggestionsCount = 0;

        const pushSection = (section: Section<AutocompleteListItem>) => {
            nextSections.push(section);
            nextSuggestionsCount += section.data.filter((item) => item.keyForList !== CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.FIND_ITEM).length;
        };

        if (searchQueryItem) {
            pushSection({data: [searchQueryItem as AutocompleteListItem], sectionIndex: sectionIndex++});
        }

        const additionalSections = getAdditionalSections?.(searchOptions, sectionIndex);

        if (additionalSections) {
            for (const section of additionalSections) {
                pushSection(section);
                sectionIndex++;
            }
        }

        if (!autocompleteQueryValue && recentSearchesData && recentSearchesData.length > 0) {
            pushSection({title: translate('search.recentSearches'), data: recentSearchesData as AutocompleteListItem[], sectionIndex: sectionIndex++});
        }

        const nextStyledRecentReports = recentReportsOptions.map((option) => {
            const report = getReportOrDraftReport(option.reportID);
            const reportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
            const shouldParserToHTML = !!reportAction && reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT;
            const shouldParseAlternateText = report?.lastActionType !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT;
            const keyForList = option.keyForList ?? option.reportID ?? (option.accountID ? String(option.accountID) : undefined);
            return {
                ...option,
                keyForList,
                pressableStyle: styles.br2,
                text: StringUtils.lineBreaksToSpaces(shouldParserToHTML ? Parser.htmlToText(option.text ?? '') : (option.text ?? '')),
                alternateText: shouldParseAlternateText ? option.alternateText : getReportSubtitlePrefix(report) + formatReportLastMessageText(option.lastMessageText ?? ''),
                wrapperStyle: [styles.pr3, styles.pl3],
            } as AutocompleteListItem;
        });

        if (!isLoadingOptions) {
            pushSection({
                title: autocompleteQueryValue.trim() === '' ? translate('search.recentChats') : undefined,
                data: nextStyledRecentReports,
                sectionIndex: sectionIndex++,
            });
        } else if (autocompleteQueryValue.trim() !== '' && nextStyledRecentReports.length > 0) {
            // When options aren't fully initialized but we have a search query with available results,
            // render them immediately so they're selectable instead of hiding the section entirely.
            pushSection({
                data: nextStyledRecentReports,
                sectionIndex: sectionIndex++,
            });
        } else if (autocompleteQueryValue.trim() === '') {
            pushSection({
                title: translate('search.recentChats'),
                data: [],
                sectionIndex: sectionIndex++,
                customHeader: (
                    <OptionsListSkeletonView
                        fixedNumItems={3}
                        shouldStyleAsTable
                        speed={CONST.TIMING.SKELETON_ANIMATION_SPEED}
                        reasonAttributes={{
                            context: 'SearchAutocompleteList',
                            isRecentSearchesDataLoaded,
                            isLoadingOptions,
                        }}
                    />
                ),
            });
        }

        if (autocompleteSuggestions.length > 0) {
            const autocompleteData: AutocompleteListItem[] = autocompleteSuggestions.map(({filterKey, text, autocompleteID, mapKey}) => {
                return {
                    text: getAutocompleteDisplayText(filterKey, text),
                    mapKey: mapKey ? getSubstitutionMapKey(mapKey, text) : undefined,
                    singleIcon: expensifyIcons.MagnifyingGlass,
                    searchQuery: text,
                    autocompleteID,
                    keyForList: autocompleteID ?? text, // in case we have a unique identifier then use it because text might not be unique
                    searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.AUTOCOMPLETE_SUGGESTION,
                };
            });

            pushSection({title: translate('search.suggestions'), data: autocompleteData, sectionIndex: sectionIndex++});
        }

        return {sections: nextSections, styledRecentReports: nextStyledRecentReports, suggestionsCount: nextSuggestionsCount};
    }, [
        autocompleteQueryValue,
        autocompleteSuggestions,
        expensifyIcons,
        getAdditionalSections,
        recentReportsOptions,
        recentSearchesData,
        searchOptions,
        searchQueryItem,
        styles,
        translate,
        isLoadingOptions,
        isRecentSearchesDataLoaded,
    ]);

    const sectionItemText = sections?.at(1)?.data?.[0]?.text ?? '';
    const normalizedReferenceText = sectionItemText.toLowerCase();
    const trimmedAutocompleteQueryValue = autocompleteQueryValue.trim();
    const isLoading = !isRecentSearchesDataLoaded;
    const suggestionsAnnouncement = suggestionsCount > 0 ? translate('search.suggestionsAvailable', {count: suggestionsCount}, trimmedAutocompleteQueryValue) : '';
    useDebouncedAccessibilityAnnouncement(suggestionsAnnouncement, !!suggestionsAnnouncement, autocompleteQueryValue);

    const noResultsFoundText = translate('common.noResultsFound');
    const shouldAnnounceNoResults = !isLoading && suggestionsCount === 0 && !!trimmedAutocompleteQueryValue;
    useDebouncedAccessibilityAnnouncement(noResultsFoundText, shouldAnnounceNoResults, autocompleteQueryValue);

    const firstRecentReportKey = styledRecentReports.at(0)?.keyForList;
    let firstRecentReportFlatIndex = -1;
    if (firstRecentReportKey) {
        let flatIndex = 0;
        for (const section of sections) {
            const hasData = (section.data?.length ?? 0) > 0;
            const hasHeader = hasData && (section.title !== undefined || ('customHeader' in section && section.customHeader !== undefined));
            if (hasHeader) {
                flatIndex++;
            }
            for (const item of section.data ?? []) {
                if (item.keyForList === firstRecentReportKey) {
                    firstRecentReportFlatIndex = flatIndex;
                    break;
                }
                flatIndex++;
            }
            if (firstRecentReportFlatIndex !== -1) {
                break;
            }
        }
    }

    // When options initialize after the list is already mounted, initiallyFocusedItemKey has no effect
    // because useState(initialFocusedIndex) in useArrowKeyFocusManager only reads the initial value.
    // Imperatively focus the first recent report once options become available (desktop only).
    useEffect(() => {
        if (shouldUseNarrowLayout || isLoadingOptions || hasSetInitialFocusRef.current || firstRecentReportFlatIndex === -1) {
            return;
        }
        hasSetInitialFocusRef.current = true;

        innerListRef.current?.updateAndScrollToFocusedIndex(firstRecentReportFlatIndex, false);
    }, [isLoadingOptions, firstRecentReportFlatIndex, shouldUseNarrowLayout]);

    useEffect(() => {
        const targetText = autocompleteQueryValue;

        if (shouldHighlight(normalizedReferenceText, targetText)) {
            onHighlightFirstItem?.();
        }
    }, [autocompleteQueryValue, onHighlightFirstItem, normalizedReferenceText]);

    if (isLoading) {
        return (
            <OptionsListSkeletonView
                fixedNumItems={4}
                shouldStyleAsTable
                speed={CONST.TIMING.SKELETON_ANIMATION_SPEED}
                reasonAttributes={reasonAttributes}
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
                contentContainerStyle: styles.pb2,
                listItemWrapperStyle: [styles.pr0, styles.pl0],
                sectionTitleStyles: styles.mhn2,
            }}
            shouldSingleExecuteRowSelect
            ref={setListRef}
            initialScrollIndex={0}
            initiallyFocusedItemKey={!shouldUseNarrowLayout ? firstRecentReportKey : undefined}
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
