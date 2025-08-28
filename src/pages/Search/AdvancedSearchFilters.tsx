import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'react-native-gesture-handler/lib/typescript/typeUtils';
import type {OnyxCollection} from 'react-native-onyx';
import Button from '@components/Button';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScrollView from '@components/ScrollView';
import type {SearchDateFilterKeys, SearchFilterKey, SearchGroupBy} from '@components/Search/types';
import SpacerView from '@components/SpacerView';
import Text from '@components/Text';
import useAdvancedSearchFilters from '@hooks/useAdvancedSearchFilters';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import type {WorkspaceListItem} from '@hooks/useWorkspaceList';
import useWorkspaceList from '@hooks/useWorkspaceList';
import {clearAllFilters, saveSearch} from '@libs/actions/Search';
import {createCardFeedKey, getCardFeedKey, getCardFeedNamesWithType, getWorkspaceCardFeedKey} from '@libs/CardFeedUtils';
import {getCardDescription, mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import {convertToDisplayStringWithoutCurrency} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {createDisplayName} from '@libs/PersonalDetailsUtils';
import {getAllTaxRates, getCleanedTagName} from '@libs/PolicyUtils';
import {getReportName} from '@libs/ReportUtils';
import {buildCannedSearchQuery, buildQueryStringFromFilterFormValues, buildSearchQueryJSON, isCannedSearchQuery, isSearchDatePreset, sortOptionsWithEmptyValue} from '@libs/SearchQueryUtils';
import {getExpenseTypeTranslationKey, getStatusOptions} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import {DATE_FILTER_KEYS} from '@src/types/form/SearchAdvancedFiltersForm';
import type {CardList, PersonalDetailsList, Policy, Report, WorkspaceCardsList} from '@src/types/onyx';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

type SectionType = {
    titleTranslationKey: TranslationPaths;
    items: Array<{
        key: SearchFilterKey;
        title: string | undefined;
        description: string;
        onPress: () => void;
    }>;
};

type FilterContext = {
    filters: Partial<SearchAdvancedFiltersForm>;
    translate: LocaleContextProps['translate'];
    localeCompare: LocaleContextProps['localeCompare'];
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
    personalDetails: PersonalDetailsList | undefined;
    allCards: CardList;
    taxRates: Record<string, string[]>;
    reports: OnyxCollection<Report>;
    workspaces: WorkspaceListItem[];
    currentType: SearchDataTypes;
    groupBy: SearchGroupBy | undefined;
};

const baseFilterConfig: Record<string, {
    getTitle: (filterKey: SearchFilterKey, context: FilterContext) => string | undefined;
    description: TranslationPaths;
    route: Route;
}> = {
    type: {
        getTitle: getFilterDisplayTitle,
        description: 'common.type',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_TYPE,
    },
    groupBy: {
        getTitle: getFilterDisplayTitle,
        description: 'search.groupBy',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_GROUP_BY,
    },
    status: {
        getTitle: getStatusFilterDisplayTitle,
        description: 'common.status',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_STATUS,
    },
    date: {
        getTitle: getFilterDateDisplayTitle,
        description: 'common.date',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_DATE,
    },
    submitted: {
        getTitle: getFilterDateDisplayTitle,
        description: 'search.filters.submitted',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_SUBMITTED,
    },
    approved: {
        getTitle: getFilterDateDisplayTitle,
        description: 'search.filters.approved',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_APPROVED,
    },
    paid: {
        getTitle: getFilterDateDisplayTitle,
        description: 'search.filters.paid',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_PAID,
    },
    exported: {
        getTitle: getFilterDateDisplayTitle,
        description: 'search.filters.exported',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_EXPORTED,
    },
    posted: {
        getTitle: getFilterDateDisplayTitle,
        description: 'search.filters.posted',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_POSTED,
    },
    withdrawn: {
        getTitle: getFilterDateDisplayTitle,
        description: 'search.filters.withdrawn',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_WITHDRAWN,
    },
    currency: {
        getTitle: getFilterDisplayTitle,
        description: 'common.currency',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_CURRENCY,
    },
    groupCurrency: {
        getTitle: getFilterDisplayTitle,
        description: 'common.groupCurrency',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_GROUP_CURRENCY,
    },
    merchant: {
        getTitle: getFilterDisplayTitle,
        description: 'common.merchant',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_MERCHANT,
    },
    description: {
        getTitle: getFilterDisplayTitle,
        description: 'common.description',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_DESCRIPTION,
    },
    reportID: {
        getTitle: getFilterDisplayTitle,
        description: 'common.reportID',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_REPORT_ID,
    },
    amount: {
        getTitle: getFilterDisplayTitle,
        description: 'iou.amount',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_AMOUNT,
    },
    total: {
        getTitle: getFilterDisplayTitle,
        description: 'common.total',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_TOTAL,
    },
    category: {
        getTitle: getFilterDisplayTitle,
        description: 'common.category',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_CATEGORY,
    },
    keyword: {
        getTitle: getFilterDisplayTitle,
        description: 'search.filters.hasKeywords',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_KEYWORD,
    },
    cardID: {
        getTitle: getFilterCardDisplayTitle,
        description: 'common.card',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_CARD,
    },
    taxRate: {
        getTitle: getFilterTaxRateDisplayTitle,
        description: 'workspace.taxes.taxRate',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_TAX_RATE,
    },
    expenseType: {
        getTitle: getFilterExpenseDisplayTitle,
        description: 'search.expenseType',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_EXPENSE_TYPE,
    },
    withdrawalType: {
        getTitle: getFilterDisplayTitle,
        description: 'search.withdrawalType',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_WITHDRAWAL_TYPE,
    },
    tag: {
        getTitle: getFilterDisplayTitle,
        description: 'common.tag',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_TAG,
    },
    from: {
        getTitle: getFilterParticipantDisplayTitle,
        description: 'common.from',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_FROM,
    },
    to: {
        getTitle: getFilterParticipantDisplayTitle,
        description: 'common.to',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_TO,
    },
    in: {
        getTitle: getFilterInDisplayTitle,
        description: 'common.in',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_IN,
    },
    title: {
        getTitle: getFilterDisplayTitle,
        description: 'common.title',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_TITLE,
    },
    assignee: {
        getTitle: getFilterParticipantDisplayTitle,
        description: 'common.assignee',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_ASSIGNEE,
    },
    reimbursable: {
        getTitle: getFilterDisplayTitle,
        description: 'common.reimbursable',
        route: ROUTES.SEARCH_ADVANCED_FILTERS_REIMBURSABLE,
    },
    billable: {
        getTitle: getFilterDisplayTitle,
        description: 'common.billable' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_BILLABLE,
    },
    policyID: {
        getTitle: getFilterWorkspaceDisplayTitle,
        description: 'workspace.common.workspace' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_WORKSPACE,
    },
};

function getFilterWorkspaceDisplayTitle(filterKey: SearchFilterKey, context: FilterContext) {
    return context.workspaces
        .filter((value) => value.policyID && context.filters.policyID?.includes(value.policyID))
        .map((value) => value.text)
        .join(', ');
}

function getFilterCardDisplayTitle(filterKey: SearchFilterKey, context: FilterContext) {
    const cardIdsFilter = context.filters[CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID] ?? [];
    const feedFilter = context.filters[CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED] ?? [];
    const workspaceCardFeeds = Object.entries(context.allCards).reduce<Record<string, WorkspaceCardsList>>((workspaceCardsFeed, [cardID, card]) => {
        const feedKey = `${createCardFeedKey(card.fundID, card.bank)}`;
        const workspaceFeedKey = getWorkspaceCardFeedKey(feedKey);
        /* eslint-disable no-param-reassign */
        workspaceCardsFeed[workspaceFeedKey] ??= {};
        workspaceCardsFeed[workspaceFeedKey][cardID] = card;
        /* eslint-enable no-param-reassign */
        return workspaceCardsFeed;
    }, {});

    const cardFeedNamesWithType = getCardFeedNamesWithType({
        workspaceCardFeeds,
        translate: context.translate,
    });

    const cardNames = Object.values(context.allCards)
        .filter((card) => cardIdsFilter.includes(card.cardID.toString()) && !feedFilter.includes(createCardFeedKey(card.fundID, card.bank)))
        .map((card) => getCardDescription(card));

    const feedNames = Object.keys(cardFeedNamesWithType)
        .filter((workspaceCardFeedKey) => {
            const feedKey = getCardFeedKey(workspaceCardFeeds, workspaceCardFeedKey);
            return !!feedKey && feedFilter.includes(feedKey);
        })
        .map((cardFeedKey) => cardFeedNamesWithType[cardFeedKey].name);

    return [...feedNames, ...cardNames].join(', ');
}

function getFilterParticipantDisplayTitle(filterKey: SearchFilterKey, context: FilterContext) {
    let accountIDs: string[] = [];
    
    // Handle specific participant filter keys
    if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM) {
        accountIDs = context.filters.from ?? [];
    } else if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TO) {
        accountIDs = context.filters.to ?? [];
    } else if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.ASSIGNEE) {
        accountIDs = context.filters.assignee ?? [];
    }

    const selectedPersonalDetails = accountIDs.map((id) => context.personalDetails?.[id]);

    return selectedPersonalDetails
        .map((personalDetail) => {
            if (!personalDetail) {
                return '';
            }

            return createDisplayName(personalDetail.login ?? '', personalDetail, context.formatPhoneNumber);
        })
        .filter(Boolean)
        .join(', ');
}

function getFilterDateDisplayTitle(filterKey: SearchFilterKey, context: FilterContext) {
    const keyOn = `${filterKey}${CONST.SEARCH.DATE_MODIFIERS.ON}` as `${SearchDateFilterKeys}${typeof CONST.SEARCH.DATE_MODIFIERS.ON}`;
    const keyAfter = `${filterKey}${CONST.SEARCH.DATE_MODIFIERS.AFTER}` as `${SearchDateFilterKeys}${typeof CONST.SEARCH.DATE_MODIFIERS.AFTER}`;
    const keyBefore = `${filterKey}${CONST.SEARCH.DATE_MODIFIERS.BEFORE}` as `${SearchDateFilterKeys}${typeof CONST.SEARCH.DATE_MODIFIERS.BEFORE}`;
    const dateOn = context.filters[keyOn];
    const dateAfter = context.filters[keyAfter];
    const dateBefore = context.filters[keyBefore];
    const dateValue = [];

    if (dateOn) {
        dateValue.push(isSearchDatePreset(dateOn) ? context.translate(`search.filters.date.presets.${dateOn}`) : context.translate('search.filters.date.on', {date: dateOn}));
    }

    if (dateAfter) {
        dateValue.push(context.translate('search.filters.date.after', {date: dateAfter}));
    }

    if (dateBefore) {
        dateValue.push(context.translate('search.filters.date.before', {date: dateBefore}));
    }

    return dateValue.join(', ');
}

function getFilterDisplayTitle(filterKey: SearchFilterKey, context: FilterContext) {
    if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT || filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TOTAL) {
        const lessThanKey = `${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}` as keyof SearchAdvancedFiltersForm;
        const greaterThanKey = `${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}` as keyof SearchAdvancedFiltersForm;

        const lessThan = context.filters[lessThanKey];
        const greaterThan = context.filters[greaterThanKey];

        if (lessThan && greaterThan) {
            return context.translate('search.filters.amount.between', {
                lessThan: convertToDisplayStringWithoutCurrency(Number(lessThan)),
                greaterThan: convertToDisplayStringWithoutCurrency(Number(greaterThan)),
            });
        }
        if (lessThan) {
            return context.translate('search.filters.amount.lessThan', {amount: convertToDisplayStringWithoutCurrency(Number(lessThan))});
        }
        if (greaterThan) {
            return context.translate('search.filters.amount.greaterThan', {amount: convertToDisplayStringWithoutCurrency(Number(greaterThan))});
        }
        // Will never happen
        return;
    }

    if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY && context.filters[filterKey]) {
        const filterArray = context.filters[filterKey] ?? [];
        return filterArray.sort(context.localeCompare).join(', ');
    }

    if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY && context.filters[filterKey]) {
        const filterArray = context.filters[filterKey] ?? [];
        return filterArray
            .sort((a, b) => sortOptionsWithEmptyValue(a, b, context.localeCompare))
            .map((value) => (value === CONST.SEARCH.CATEGORY_EMPTY_VALUE ? context.translate('search.noCategory') : value))
            .join(', ');
    }

    if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG && context.filters[filterKey]) {
        const filterArray = context.filters[filterKey] ?? [];
        return filterArray
            .sort((a, b) => sortOptionsWithEmptyValue(a, b, context.localeCompare))
            .map((value) => (value === CONST.SEARCH.TAG_EMPTY_VALUE ? context.translate('search.noTag') : getCleanedTagName(value)))
            .join(', ');
    }

    if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION || filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE) {
        return context.filters[filterKey];
    }

    if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE || filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE) {
        const filterValue = context.filters[filterKey];
        return filterValue ? context.translate(`common.${filterValue as ValueOf<typeof CONST.SEARCH.BOOLEAN>}`) : undefined;
    }

    if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE) {
        const filterValue = context.filters[filterKey];
        return filterValue ? context.translate(`common.${filterValue as ValueOf<typeof CONST.SEARCH.DATA_TYPES>}`) : undefined;
    }

    if (filterKey === CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY) {
        const filterValue = context.filters[filterKey];
        return filterValue ? context.translate(`search.filters.groupBy.${filterValue}`) : undefined;
    }

    if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE) {
        const filterValue = context.filters[filterKey];
        return filterValue ? context.translate(`search.filters.withdrawalType.${filterValue}`) : undefined;
    }

    const filterValue = context.filters[filterKey];
    return Array.isArray(filterValue) ? filterValue.join(', ') : filterValue;
}

function getStatusFilterDisplayTitle(filterKey: SearchFilterKey, context: FilterContext) {
    const statusOptions = getStatusOptions(context.currentType, context.groupBy).concat({text: context.translate('common.all'), value: CONST.SEARCH.STATUS.EXPENSE.ALL});
    let filterValue = context.filters?.status;

    if (!filterValue?.length) {
        return undefined;
    }

    if (typeof filterValue === 'string') {
        filterValue = filterValue.split(',');
    }

    return filterValue
        .reduce((acc, value) => {
            const status = statusOptions.find((statusOption) => statusOption.value === value);
            if (status) {
                return acc.concat(status.text);
            }
            return acc;
        }, [] as string[])
        .join(', ');
}

function getFilterTaxRateDisplayTitle(filterKey: SearchFilterKey, context: FilterContext) {
    const selectedTaxRateKeys = context.filters[CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE];
    if (!selectedTaxRateKeys) {
        return undefined;
    }

    const result: string[] = [];
    Object.entries(context.taxRates).forEach(([taxRateName, taxRateKeys]) => {
        if (!taxRateKeys.some((taxRateKey) => selectedTaxRateKeys.includes(taxRateKey)) || result.includes(taxRateName)) {
            return;
        }
        result.push(taxRateName);
    });

    return result.join(', ');
}

function getFilterExpenseDisplayTitle(filterKey: SearchFilterKey, context: FilterContext) {
    const filterValue = context.filters[CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE];
    return filterValue
        ? Object.values(CONST.SEARCH.TRANSACTION_TYPE)
              .filter((expenseType) => filterValue.includes(expenseType))
              .map((expenseType) => context.translate(getExpenseTypeTranslationKey(expenseType)))
              .join(', ')
        : undefined;
}

function getFilterInDisplayTitle(filterKey: SearchFilterKey, context: FilterContext) {
    return context.filters.in
        ? context.filters.in
              .map((id) => getReportName(context.reports?.[`${ONYXKEYS.COLLECTION.REPORT}${id}`]))
              .filter(Boolean)
              .join(', ')
        : undefined;
}

function AdvancedSearchFilters() {
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const styles = useThemeStyles();
    const {singleExecution} = useSingleExecution();
    const waitForNavigate = useWaitForNavigation();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES, {canBeMissing: true});
    const [searchAdvancedFilters = getEmptyObject<SearchAdvancedFiltersForm>()] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});

    const groupBy = searchAdvancedFilters.groupBy;
    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: false});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: false});
    const allCards = useMemo(() => mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, userCardList, true), [userCardList, workspaceCardFeeds]);
    const taxRates = getAllTaxRates();
    const personalDetails = usePersonalDetails();

    const [policies = getEmptyObject<NonNullable<OnyxCollection<Policy>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});

    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false, selector: (session) => session?.email});

    const {sections: workspaces} = useWorkspaceList({
        policies,
        currentUserLogin,
        shouldShowPendingDeletePolicy: false,
        selectedPolicyIDs: undefined,
        searchTerm: '',
        localeCompare,
    });

    const {currentType, typeFiltersKeys} = useAdvancedSearchFilters();

    const queryString = useMemo(() => buildQueryStringFromFilterFormValues(searchAdvancedFilters), [searchAdvancedFilters]);
    const queryJSON = useMemo(() => buildSearchQueryJSON(queryString || buildCannedSearchQuery()), [queryString]);

    const applyFiltersAndNavigate = () => {
        clearAllFilters();
        Navigation.navigate(
            ROUTES.SEARCH_ROOT.getRoute({
                query: queryString,
            }),
            {forceReplace: true},
        );
    };

    const onSaveSearch = () => {
        const savedSearchKeys = Object.keys(savedSearches ?? {});
        if (!queryJSON || (savedSearches && savedSearchKeys.includes(String(queryJSON.hash)))) {
            // If the search is already saved, we only display the results as we don't need to save it.
            applyFiltersAndNavigate();
            return;
        }

        saveSearch({
            queryJSON,
        });

        applyFiltersAndNavigate();
    };

    const filterContext: FilterContext = {
        filters: searchAdvancedFilters,
        translate,
        localeCompare,
        formatPhoneNumber,
        personalDetails,
        allCards,
        taxRates,
        reports,
        workspaces: workspaces.flatMap((value) => value.data),
        currentType,
        groupBy,
    };

    const filters = typeFiltersKeys.map((section) => {
        return section.map((key: SearchFilterKey) => {
            const config = baseFilterConfig[key];
            const onPress = singleExecution(waitForNavigate(() => Navigation.navigate(config.route)));
            const filterTitle = config.getTitle(key, filterContext);
            
            const item = {
                key,
                title: filterTitle,
                description: translate(config.description),
                onPress,
            };
            return item;
        });
    });
    const displaySearchButton = queryJSON && !isCannedSearchQuery(queryJSON);

    const sections: SectionType[] = [
        {
            titleTranslationKey: 'common.general',
            items: filters.at(0) ?? [],
        },
        {
            titleTranslationKey: 'common.expenses',
            items: filters.at(1) ?? [],
        },
        {
            titleTranslationKey: 'common.reports',
            items: filters.at(2) ?? [],
        },
    ];

    sections.forEach((section) => {
        section.items.sort((a, b) => {
            if (a.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE) {
                return -1;
            }
            if (b.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE) {
                return 1;
            }
            return localeCompare(a.description, b.description);
        });
    });

    return (
        <>
            <ScrollView contentContainerStyle={[styles.flexGrow1, styles.justifyContentBetween]}>
                <View>
                    {sections.map((section, index) => {
                        if (section.items.length === 0) {
                            return;
                        }

                        return (
                            // eslint-disable-next-line react/no-array-index-key
                            <View key={`${section.items.at(0)?.key}-${index}`}>
                                {index !== 0 && (
                                    <SpacerView
                                        shouldShow
                                        style={[styles.reportHorizontalRule]}
                                    />
                                )}
                                <Text style={[styles.headerText, styles.reportHorizontalRule, index === 0 ? null : styles.mt4, styles.mb2]}>{translate(section.titleTranslationKey)}</Text>
                                {section.items.map((item) => {
                                    return (
                                        <MenuItemWithTopDescription
                                            key={item.description}
                                            title={item.title}
                                            titleStyle={styles.flex1}
                                            description={item.description}
                                            shouldShowRightIcon
                                            onPress={item.onPress}
                                        />
                                    );
                                })}
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
            {!!displaySearchButton && (
                <Button
                    text={translate('search.saveSearch')}
                    onPress={onSaveSearch}
                    style={[styles.mh4, styles.mt4]}
                    large
                />
            )}
            <FormAlertWithSubmitButton
                buttonText={translate('search.viewResults')}
                containerStyles={[styles.m4, styles.mb5]}
                onSubmit={applyFiltersAndNavigate}
                enabledWhenOffline
            />
        </>
    );
}

AdvancedSearchFilters.displayName = 'AdvancedSearchFilters';

export default AdvancedSearchFilters;
