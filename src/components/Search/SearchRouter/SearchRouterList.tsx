import {Str} from 'expensify-common';
import React, {forwardRef, useCallback, useMemo} from 'react';
import type {ForwardedRef} from 'react';
import {useOnyx} from 'react-native-onyx';
import * as Expensicons from '@components/Icon/Expensicons';
import {usePersonalDetails} from '@components/OnyxProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import type {SearchFilterKey, SearchQueryString} from '@components/Search/types';
import SelectionList from '@components/SelectionList';
import SearchQueryListItem from '@components/SelectionList/Search/SearchQueryListItem';
import type {SearchQueryItem, SearchQueryListItemProps} from '@components/SelectionList/Search/SearchQueryListItem';
import type {SectionListDataType, SelectionListHandle, UserListItemProps} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import Performance from '@libs/Performance';
import {getAllTaxRates} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import {
    getAutocompleteCategories,
    getAutocompleteRecentCategories,
    getAutocompleteRecentTags,
    getAutocompleteTags,
    getAutocompleteTaxList,
    getQueryWithoutAutocompletedPart,
    parseForAutocomplete,
} from '@libs/SearchAutocompleteUtils';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import * as ReportUserActions from '@userActions/Report';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type PersonalDetails from '@src/types/onyx/PersonalDetails';
import {getSubstitutionMapKey} from './getQueryWithSubstitutions';

type AutocompleteItemData = {
    filterKey: SearchFilterKey;
    text: string;
    autocompleteID?: string;
};

type SearchRouterListProps = {
    /** Value of TextInput */
    textInputValue: string;

    /** An optional item to always display on the top of the router list  */
    searchQueryItem?: SearchQueryItem;

    /** Any extra sections that should be displayed in the router list */
    additionalSections?: Array<SectionListDataType<OptionData | SearchQueryItem>>;

    /** Callback to update text input value along with autocomplete suggestions */
    onSearchQueryChange: (newValue: string) => void;

    /** Callback to update text input value */
    setTextInputValue: (text: string) => void;

    /** Callback to submit query when selecting a list item */
    onSearchSubmit: (query: SearchQueryString) => void;

    /** Callback to run when user clicks a suggestion item that contains autocomplete data */
    onAutocompleteSuggestionClick: (autocompleteKey: string, autocompleteID: string) => void;

    /** Callback to close and clear SearchRouter */
    closeRouter: () => void;
};

const setPerformanceTimersEnd = () => {
    Timing.end(CONST.TIMING.OPEN_SEARCH);
    Performance.markEnd(CONST.TIMING.OPEN_SEARCH);
};

function getContextualSearchQuery(item: SearchQueryItem) {
    const baseQuery = `${CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE}:${item.roomType}`;
    let additionalQuery = '';

    switch (item.roomType) {
        case CONST.SEARCH.DATA_TYPES.EXPENSE:
        case CONST.SEARCH.DATA_TYPES.INVOICE:
            additionalQuery += ` ${CONST.SEARCH.SYNTAX_ROOT_KEYS.POLICY_ID}:${item.policyID}`;
            if (item.roomType === CONST.SEARCH.DATA_TYPES.INVOICE && item.autocompleteID) {
                additionalQuery += ` ${CONST.SEARCH.SYNTAX_FILTER_KEYS.TO}:${SearchQueryUtils.sanitizeSearchValue(item.searchQuery ?? '')}`;
            }
            break;
        case CONST.SEARCH.DATA_TYPES.CHAT:
        default:
            additionalQuery = ` ${CONST.SEARCH.SYNTAX_FILTER_KEYS.IN}:${SearchQueryUtils.sanitizeSearchValue(item.searchQuery ?? '')}`;
            break;
    }
    return baseQuery + additionalQuery;
}

function isSearchQueryItem(item: OptionData | SearchQueryItem): item is SearchQueryItem {
    return 'searchItemType' in item;
}

function isSearchQueryListItem(listItem: UserListItemProps<OptionData> | SearchQueryListItemProps): listItem is SearchQueryListItemProps {
    return isSearchQueryItem(listItem.item);
}

function getItemHeight(item: OptionData | SearchQueryItem) {
    if (isSearchQueryItem(item)) {
        return 44;
    }
    return 64;
}

function SearchRouterItem(props: UserListItemProps<OptionData> | SearchQueryListItemProps) {
    const styles = useThemeStyles();

    if (isSearchQueryListItem(props)) {
        return (
            <SearchQueryListItem
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        );
    }
    return (
        <UserListItem
            pressableStyle={[styles.br2, styles.ph3]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

function SearchRouterList(
    {textInputValue, searchQueryItem, additionalSections, onSearchQueryChange, setTextInputValue, onSearchSubmit, onAutocompleteSuggestionClick, closeRouter}: SearchRouterListProps,
    ref: ForwardedRef<SelectionListHandle>,
) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const {activeWorkspaceID} = useActiveWorkspace();
    const policy = usePolicy(activeWorkspaceID);
    const [betas] = useOnyx(ONYXKEYS.BETAS);

    const {options, areOptionsInitialized} = useOptionsList();
    const searchOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return {recentReports: [], personalDetails: [], userToInvite: null, currentUserOption: null, categoryOptions: [], tagOptions: [], taxRatesOptions: []};
        }
        return OptionsListUtils.getSearchOptions(options, '', betas ?? []);
    }, [areOptionsInitialized, betas, options]);

    const typeAutocompleteList = Object.values(CONST.SEARCH.DATA_TYPES);
    const statusAutocompleteList = Object.values({...CONST.SEARCH.STATUS.TRIP, ...CONST.SEARCH.STATUS.INVOICE, ...CONST.SEARCH.STATUS.CHAT, ...CONST.SEARCH.STATUS.TRIP});
    const expenseTypes = Object.values(CONST.SEARCH.TRANSACTION_TYPE);

    const [cardList = {}] = useOnyx(ONYXKEYS.CARD_LIST);
    const cardAutocompleteList = Object.values(cardList);
    const personalDetailsForParticipants = usePersonalDetails();
    const participantsAutocompleteList = useMemo(
        () =>
            Object.values(personalDetailsForParticipants)
                .filter((details): details is NonNullable<PersonalDetails> => !!(details && details?.login))
                .map((details) => ({
                    name: details.displayName ?? Str.removeSMSDomain(details.login ?? ''),
                    accountID: details?.accountID.toString(),
                })),
        [personalDetailsForParticipants],
    );
    const taxRates = getAllTaxRates();
    const taxAutocompleteList = useMemo(() => getAutocompleteTaxList(taxRates, policy), [policy, taxRates]);
    const [allPolicyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const [allRecentCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES);
    const categoryAutocompleteList = useMemo(() => {
        return getAutocompleteCategories(allPolicyCategories, activeWorkspaceID);
    }, [activeWorkspaceID, allPolicyCategories]);
    const recentCategoriesAutocompleteList = useMemo(() => {
        return getAutocompleteRecentCategories(allRecentCategories, activeWorkspaceID);
    }, [activeWorkspaceID, allRecentCategories]);

    const [currencyList] = useOnyx(ONYXKEYS.CURRENCY_LIST);
    const currencyAutocompleteList = Object.keys(currencyList ?? {});
    const [recentCurrencyAutocompleteList] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);
    const [allPoliciesTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);
    const [allRecentTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS);
    const tagAutocompleteList = useMemo(() => {
        return getAutocompleteTags(allPoliciesTags, activeWorkspaceID);
    }, [activeWorkspaceID, allPoliciesTags]);
    const recentTagsAutocompleteList = getAutocompleteRecentTags(allRecentTags, activeWorkspaceID);

    const autocompleteSuggestions = useMemo<AutocompleteItemData[]>(() => {
        const autocompleteParsedQuery = parseForAutocomplete(textInputValue);
        const {autocomplete, ranges = []} = autocompleteParsedQuery ?? {};
        const autocompleteKey = autocomplete?.key;
        const autocompleteValue = autocomplete?.value ?? '';

        const alreadyAutocompletedKeys = ranges
            .filter((range) => {
                return autocompleteKey && range.key === autocompleteKey;
            })
            .map((range) => range.value.toLowerCase());

        switch (autocompleteKey) {
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG: {
                const autocompleteList = autocompleteValue ? tagAutocompleteList : recentTagsAutocompleteList ?? [];
                const filteredTags = autocompleteList
                    .filter((tag) => tag.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(tag))
                    .sort()
                    .slice(0, 10);

                return filteredTags.map((tagName) => ({
                    filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG,
                    text: tagName,
                }));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY: {
                const autocompleteList = autocompleteValue ? categoryAutocompleteList : recentCategoriesAutocompleteList;
                const filteredCategories = autocompleteList
                    .filter((category) => category.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(category.toLowerCase()))
                    .sort()
                    .slice(0, 10);

                return filteredCategories.map((categoryName) => ({
                    filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY,
                    text: categoryName,
                }));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY: {
                const autocompleteList = autocompleteValue ? currencyAutocompleteList : recentCurrencyAutocompleteList ?? [];
                const filteredCurrencies = autocompleteList
                    .filter((currency) => currency.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(currency.toLowerCase()))
                    .sort()
                    .slice(0, 10);

                return filteredCurrencies.map((currencyName) => ({
                    filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY,
                    text: currencyName,
                }));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE: {
                const filteredTaxRates = taxAutocompleteList
                    .filter((tax) => tax.taxRateName.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(tax.taxRateName.toLowerCase()))
                    .sort()
                    .slice(0, 10);

                return filteredTaxRates.map((tax) => ({
                    filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE,
                    text: tax.taxRateName,
                    autocompleteID: tax.taxRateIds.join(','),
                }));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM: {
                const filteredParticipants = participantsAutocompleteList
                    .filter((participant) => participant.name.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(participant.name.toLowerCase()))
                    .sort()
                    .slice(0, 10);

                return filteredParticipants.map((participant) => ({
                    filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
                    text: participant.name,
                    autocompleteID: participant.accountID,
                }));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.TO: {
                const filteredParticipants = participantsAutocompleteList
                    .filter((participant) => participant.name.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(participant.name.toLowerCase()))
                    .sort()
                    .slice(0, 10);

                return filteredParticipants.map((participant) => ({
                    filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.TO,
                    text: participant.name,
                    autocompleteID: participant.accountID,
                }));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.IN: {
                const filteredChats = searchOptions.recentReports
                    .filter((chat) => chat.text?.toLowerCase()?.includes(autocompleteValue.toLowerCase()))
                    .sort((chatA, chatB) => (chatA > chatB ? 1 : -1))
                    .slice(0, 10);

                return filteredChats.map((chat) => ({
                    filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.IN,
                    text: chat.text ?? '',
                    autocompleteID: chat.reportID,
                }));
            }
            case CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE: {
                const filteredTypes = typeAutocompleteList
                    .filter((type) => type.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(type.toLowerCase()))
                    .sort();

                return filteredTypes.map((type) => ({filterKey: CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE, text: type}));
            }
            case CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS: {
                const filteredStatuses = statusAutocompleteList
                    .filter((status) => status.includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(status))
                    .sort()
                    .slice(0, 10);

                return filteredStatuses.map((status) => ({filterKey: CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS, text: status}));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE: {
                const filteredExpenseTypes = expenseTypes
                    .filter((expenseType) => expenseType.includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(expenseType))
                    .sort();

                return filteredExpenseTypes.map((expenseType) => ({
                    filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE,
                    text: expenseType,
                }));
            }
            case CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID: {
                const filteredCards = cardAutocompleteList
                    .filter((card) => card.bank.toLowerCase().includes(autocompleteValue.toLowerCase()) && !alreadyAutocompletedKeys.includes(card.bank.toLowerCase()))
                    .sort()
                    .slice(0, 10);

                return filteredCards.map((card) => ({
                    filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID,
                    text: CardUtils.getCardDescription(card.cardID),
                    autocompleteID: card.cardID.toString(),
                }));
            }
            default: {
                return [];
            }
        }
    }, [
        textInputValue,
        tagAutocompleteList,
        recentTagsAutocompleteList,
        categoryAutocompleteList,
        recentCategoriesAutocompleteList,
        currencyAutocompleteList,
        recentCurrencyAutocompleteList,
        taxAutocompleteList,
        participantsAutocompleteList,
        searchOptions.recentReports,
        typeAutocompleteList,
        statusAutocompleteList,
        expenseTypes,
        cardAutocompleteList,
    ]);

    const sections: Array<SectionListDataType<OptionData | SearchQueryItem>> = [];

    if (searchQueryItem) {
        sections.push({data: [searchQueryItem]});
    }

    if (autocompleteSuggestions.length > 0) {
        const autocompleteData = autocompleteSuggestions.map(({filterKey, text, autocompleteID}) => {
            return {
                text: getSubstitutionMapKey(filterKey, text),
                singleIcon: Expensicons.MagnifyingGlass,
                searchQuery: text,
                autocompleteID,
                keyForList: autocompleteID ?? text, // in case we have a unique identifier then use it because text might not be unique
                searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.AUTOCOMPLETE_SUGGESTION,
            };
        });

        sections.push({title: translate('search.suggestions'), data: autocompleteData});
    }

    if (additionalSections) {
        sections.push(...additionalSections);
    }

    const onSelectRow = useCallback(
        (item: OptionData | SearchQueryItem) => {
            if (isSearchQueryItem(item)) {
                if (!item.searchQuery) {
                    return;
                }
                if (item.searchItemType === CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.CONTEXTUAL_SUGGESTION) {
                    const searchQuery = getContextualSearchQuery(item);
                    onSearchQueryChange(`${searchQuery} `);

                    if (item.roomType === CONST.SEARCH.DATA_TYPES.INVOICE && item.autocompleteID) {
                        const autocompleteKey = `${CONST.SEARCH.SYNTAX_FILTER_KEYS.TO}:${item.searchQuery}`;
                        onAutocompleteSuggestionClick(autocompleteKey, item.autocompleteID);
                    }
                    if (item.roomType === CONST.SEARCH.DATA_TYPES.CHAT && item.autocompleteID) {
                        const autocompleteKey = `${CONST.SEARCH.SYNTAX_FILTER_KEYS.IN}:${item.searchQuery}`;
                        onAutocompleteSuggestionClick(autocompleteKey, item.autocompleteID);
                    }
                    return;
                }
                if (item.searchItemType === CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.AUTOCOMPLETE_SUGGESTION && textInputValue) {
                    const trimmedUserSearchQuery = getQueryWithoutAutocompletedPart(textInputValue);
                    onSearchQueryChange(`${trimmedUserSearchQuery}${SearchQueryUtils.sanitizeSearchValue(item.searchQuery)} `);

                    if (item.autocompleteID && item.text) {
                        onAutocompleteSuggestionClick(item.text, item.autocompleteID);
                    }
                    return;
                }

                onSearchSubmit(item.searchQuery);
            }

            // Handle selection of "Recent chat"
            closeRouter();
            if ('reportID' in item && item?.reportID) {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(item?.reportID));
            } else if ('login' in item) {
                ReportUserActions.navigateToAndOpenReport(item.login ? [item.login] : [], false);
            }
        },
        [closeRouter, textInputValue, onSearchSubmit, onSearchQueryChange, onAutocompleteSuggestionClick],
    );

    const onArrowFocus = useCallback(
        (focusedItem: OptionData | SearchQueryItem) => {
            if (!isSearchQueryItem(focusedItem) || focusedItem?.searchItemType !== CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.AUTOCOMPLETE_SUGGESTION || !focusedItem.searchQuery) {
                return;
            }

            const trimmedUserSearchQuery = getQueryWithoutAutocompletedPart(textInputValue);

            setTextInputValue(`${trimmedUserSearchQuery}${SearchQueryUtils.sanitizeSearchValue(focusedItem.searchQuery)} `);

            if (focusedItem.autocompleteID && focusedItem.text) {
                onAutocompleteSuggestionClick(focusedItem.text, focusedItem.autocompleteID);
            }
        },
        [setTextInputValue, textInputValue, onAutocompleteSuggestionClick],
    );

    return (
        <SelectionList<OptionData | SearchQueryItem>
            sections={sections}
            onSelectRow={onSelectRow}
            ListItem={SearchRouterItem}
            containerStyle={[styles.mh100]}
            sectionListStyle={[shouldUseNarrowLayout ? styles.ph5 : styles.ph2, styles.pb2]}
            listItemWrapperStyle={[styles.pr0, styles.pl0]}
            getItemHeight={getItemHeight}
            onLayout={setPerformanceTimersEnd}
            ref={ref}
            showScrollIndicator={!shouldUseNarrowLayout}
            sectionTitleStyles={styles.mhn2}
            shouldSingleExecuteRowSelect
            onArrowFocus={onArrowFocus}
        />
    );
}

export default forwardRef(SearchRouterList);
export {SearchRouterItem};
