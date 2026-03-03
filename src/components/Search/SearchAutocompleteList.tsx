import type {ForwardedRef, RefObject} from 'react';
import React, {useEffect, useRef, useState} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {useOptionsList} from '@components/OptionListContextProvider';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import type {ListItem as NewListItem, UserListItemProps} from '@components/SelectionList/ListItem/types';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {Section, SelectionListWithSectionsHandle} from '@components/SelectionList/SelectionListWithSections/types';
// eslint-disable-next-line no-restricted-imports
import type {SearchQueryItem, SearchQueryListItemProps} from '@components/SelectionListWithSections/Search/SearchQueryListItem';
import SearchQueryListItem, {isSearchQueryItem} from '@components/SelectionListWithSections/Search/SearchQueryListItem';
import useAutocompleteSuggestions from '@hooks/useAutocompleteSuggestions';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebounce from '@hooks/useDebounce';
import useFeedKeysWithAssignedCards from '@hooks/useFeedKeysWithAssignedCards';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import FS from '@libs/Fullstory';
import type {Options, SearchOption} from '@libs/OptionsListUtils';
import {combineOrderingOfReportsAndPersonalDetails, getSearchOptions} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {getReportAction} from '@libs/ReportActionsUtils';
import type {OptionData} from '@libs/ReportUtils';
import {getReportOrDraftReport} from '@libs/ReportUtils';
import {buildSearchQueryJSON, buildUserReadableQueryString, getQueryWithoutFilters, shouldHighlight} from '@libs/SearchQueryUtils';
import StringUtils from '@libs/StringUtils';
import {endSpan} from '@libs/telemetry/activeSpans';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardFeeds, CardList, PersonalDetailsList, Policy, Report} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
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

    /** Personal details */
    personalDetails: OnyxEntry<PersonalDetailsList>;

    /** Reports */
    reports: OnyxCollection<Report>;

    /** All feeds */
    allFeeds: Record<string, CardFeeds | undefined> | undefined;

    /** All cards */
    allCards: CardList | undefined;

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
    personalDetails,
    reports,
    allFeeds,
    allCards = CONST.EMPTY_OBJECT,
    ref,
}: SearchAutocompleteListProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const feedKeysWithCards = useFeedKeysWithAssignedCards();
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT);
    const [nvpDismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING);
    const [recentSearches, recentSearchesMetadata] = useOnyx(ONYXKEYS.RECENT_SEARCHES);
    const [countryCode] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const [policies = getEmptyObject<NonNullable<OnyxCollection<Policy>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserEmail = currentUserPersonalDetails.email ?? '';
    const currentUserAccountID = currentUserPersonalDetails.accountID;
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['History', 'MagnifyingGlass']);
    const taxRates = getAllTaxRates(policies);

    const {options, areOptionsInitialized} = useOptionsList();
    const searchOptions = (() => {
        if (!areOptionsInitialized) {
            return defaultListOptions;
        }
        return getSearchOptions({
            options,
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
        });
    })();

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
            // When query changes, focus on the search query item (index 0) and scroll to top
            // onHighlightFirstItem will switch focus to the first result when there's a good match
            innerListRef.current?.updateAndScrollToFocusedIndex(0, true);
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
        options,
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
    });

    const autocompleteQueryWithoutFilters = getQueryWithoutFilters(autocompleteQueryValue);

    const sortedRecentSearches = Object.values(recentSearches ?? {}).sort((a, b) => localeCompare(b.timestamp, a.timestamp));

    const recentSearchesData = sortedRecentSearches?.slice(0, 5).map(({query, timestamp}) => {
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
                  })
                : query,
            singleIcon: expensifyIcons.History,
            searchQuery: query,
            keyForList: timestamp,
            searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.SEARCH,
        };
    });

    const recentReportsOptions = (() => {
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
    })();

    const debounceHandleSearch = useDebounce(() => {
        if (!handleSearch || !autocompleteQueryWithoutFilters) {
            return;
        }

        handleSearch(autocompleteQueryWithoutFilters);
    }, CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME);

    useEffect(() => {
        debounceHandleSearch();
    }, [autocompleteQueryWithoutFilters, debounceHandleSearch]);

    /* Sections generation */
    const sections: Array<Section<AutocompleteListItem>> = [];
    let sectionIndex = 0;

    if (searchQueryItem) {
        sections.push({data: [searchQueryItem as AutocompleteListItem], sectionIndex: sectionIndex++});
    }

    const additionalSections = getAdditionalSections?.(searchOptions, sectionIndex);

    if (additionalSections) {
        for (const section of additionalSections) {
            sections.push(section);
            sectionIndex++;
        }
    }

    if (!autocompleteQueryValue && recentSearchesData && recentSearchesData.length > 0) {
        sections.push({title: translate('search.recentSearches'), data: recentSearchesData as AutocompleteListItem[], sectionIndex: sectionIndex++});
    }
    const styledRecentReports = recentReportsOptions.map((option) => {
        const report = getReportOrDraftReport(option.reportID);
        const reportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
        const shouldParserToHTML = reportAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT;
        const keyForList = option.keyForList ?? option.reportID ?? (option.accountID ? String(option.accountID) : undefined);
        return {
            ...option,
            keyForList,
            pressableStyle: styles.br2,
            text: StringUtils.lineBreaksToSpaces(shouldParserToHTML ? Parser.htmlToText(option.text ?? '') : (option.text ?? '')),
            wrapperStyle: [styles.pr3, styles.pl3],
        } as AutocompleteListItem;
    });

    sections.push({title: autocompleteQueryValue.trim() === '' ? translate('search.recentChats') : undefined, data: styledRecentReports, sectionIndex: sectionIndex++});

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

        sections.push({title: translate('search.suggestions'), data: autocompleteData, sectionIndex: sectionIndex++});
    }

    const sectionItemText = sections?.at(1)?.data?.[0]?.text ?? '';
    const normalizedReferenceText = sectionItemText.toLowerCase();

    const firstRecentReportKey = styledRecentReports.at(0)?.keyForList;

    // When options initialize after the list is already mounted, initiallyFocusedItemKey has no effect
    // because useState(initialFocusedIndex) in useArrowKeyFocusManager only reads the initial value.
    // Imperatively focus the first recent report once options become available (desktop only).
    useEffect(() => {
        if (shouldUseNarrowLayout || !areOptionsInitialized || hasSetInitialFocusRef.current || !firstRecentReportKey) {
            return;
        }
        hasSetInitialFocusRef.current = true;

        // Compute the flat index of firstRecentReportKey by replicating the flattening logic
        // from useFlattenedSections: each section may prepend a header row when it has a title/customHeader.
        let flatIndex = 0;
        for (const section of sections) {
            const hasData = (section.data?.length ?? 0) > 0;
            const hasHeader = hasData && (section.title !== undefined || ('customHeader' in section && section.customHeader !== undefined));
            if (hasHeader) {
                flatIndex++;
            }
            for (const item of section.data ?? []) {
                if (item.keyForList === firstRecentReportKey) {
                    innerListRef.current?.updateAndScrollToFocusedIndex(flatIndex, false);
                    return;
                }
                flatIndex++;
            }
        }
    }, [areOptionsInitialized, firstRecentReportKey, shouldUseNarrowLayout]);

    useEffect(() => {
        const targetText = autocompleteQueryValue;

        if (shouldHighlight(normalizedReferenceText, targetText)) {
            onHighlightFirstItem?.();
        }
    }, [autocompleteQueryValue, onHighlightFirstItem, normalizedReferenceText]);

    const isRecentSearchesDataLoaded = !isLoadingOnyxValue(recentSearchesMetadata);
    const isLoading = !isRecentSearchesDataLoaded || !areOptionsInitialized;

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
            showLoadingPlaceholder
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
export type {GetAdditionalSectionsCallback};
