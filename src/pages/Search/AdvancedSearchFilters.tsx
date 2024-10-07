import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'react-native-gesture-handler/lib/typescript/typeUtils';
import type {OnyxCollection} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {usePersonalDetails} from '@components/OnyxProvider';
import ScrollView from '@components/ScrollView';
import type {AdvancedFiltersKeys} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import {convertToDisplayStringWithoutCurrency} from '@libs/CurrencyUtils';
import localeCompare from '@libs/LocaleCompare';
import Navigation from '@libs/Navigation/Navigation';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import {getAllTaxRates} from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as SearchUtils from '@libs/SearchUtils';
import * as SearchActions from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {CardList, PersonalDetailsList, Report} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

const baseFilterConfig = {
    date: {
        getTitle: getFilterDisplayTitle,
        description: 'common.date' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_DATE,
    },
    currency: {
        getTitle: getFilterDisplayTitle,
        description: 'common.currency' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_CURRENCY,
    },
    merchant: {
        getTitle: getFilterDisplayTitle,
        description: 'common.merchant' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_MERCHANT,
    },
    description: {
        getTitle: getFilterDisplayTitle,
        description: 'common.description' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_DESCRIPTION,
    },
    reportID: {
        getTitle: getFilterDisplayTitle,
        description: 'common.reportID' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_REPORT_ID,
    },
    amount: {
        getTitle: getFilterDisplayTitle,
        description: 'common.total' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_AMOUNT,
    },
    category: {
        getTitle: getFilterDisplayTitle,
        description: 'common.category' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_CATEGORY,
    },
    keyword: {
        getTitle: getFilterDisplayTitle,
        description: 'search.filters.hasKeywords' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_KEYWORD,
    },
    cardID: {
        getTitle: getFilterCardDisplayTitle,
        description: 'common.card' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_CARD,
    },
    taxRate: {
        getTitle: getFilterTaxRateDisplayTitle,
        description: 'workspace.taxes.taxRate' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_TAX_RATE,
    },
    expenseType: {
        getTitle: getFilterExpenseDisplayTitle,
        description: 'search.expenseType' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_EXPENSE_TYPE,
    },
    tag: {
        getTitle: getFilterDisplayTitle,
        description: 'common.tag' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_TAG,
    },
    from: {
        getTitle: getFilterParticipantDisplayTitle,
        description: 'common.from' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_FROM,
    },
    to: {
        getTitle: getFilterParticipantDisplayTitle,
        description: 'common.to' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_TO,
    },
    in: {
        getTitle: getFilterInDisplayTitle,
        description: 'common.in' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_IN,
    },
};

const typeFiltersKeys: Record<string, Array<ValueOf<typeof CONST.SEARCH.SYNTAX_FILTER_KEYS>>> = {
    [CONST.SEARCH.DATA_TYPES.EXPENSE]: ['date', 'currency', 'merchant', 'description', 'reportID', 'amount', 'category', 'keyword', 'taxRate', 'expenseType', 'tag', 'from', 'to', 'cardID'],
    [CONST.SEARCH.DATA_TYPES.INVOICE]: ['date', 'currency', 'merchant', 'description', 'reportID', 'amount', 'category', 'keyword', 'taxRate', 'tag', 'from', 'to', 'cardID'],
    [CONST.SEARCH.DATA_TYPES.TRIP]: ['date', 'currency', 'merchant', 'description', 'reportID', 'amount', 'category', 'keyword', 'taxRate', 'tag', 'from', 'to', 'cardID'],
    [CONST.SEARCH.DATA_TYPES.CHAT]: ['date', 'keyword', 'from', 'in'],
};

function getFilterCardDisplayTitle(filters: Partial<SearchAdvancedFiltersForm>, cards: CardList) {
    const filterValue = filters[CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID];
    return filterValue
        ? Object.values(cards)
              .filter((card) => filterValue.includes(card.cardID.toString()))
              .map((card) => card.bank)
              .join(', ')
        : undefined;
}

function getFilterParticipantDisplayTitle(accountIDs: string[], personalDetails: PersonalDetailsList) {
    const selectedPersonalDetails = accountIDs.map((id) => personalDetails[id]);

    return selectedPersonalDetails
        .map((personalDetail) => {
            if (!personalDetail) {
                return '';
            }

            return PersonalDetailsUtils.createDisplayName(personalDetail.login ?? '', personalDetail);
        })
        .join(', ');
}

function getFilterDisplayTitle(filters: Partial<SearchAdvancedFiltersForm>, fieldName: AdvancedFiltersKeys, translate: LocaleContextProps['translate']) {
    if (fieldName === CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE) {
        // the value of date filter is a combination of dateBefore + dateAfter values
        const {dateAfter, dateBefore} = filters;
        let dateValue = '';
        if (dateBefore) {
            dateValue = translate('search.filters.date.before', {date: dateBefore});
        }
        if (dateBefore && dateAfter) {
            dateValue += ', ';
        }
        if (dateAfter) {
            dateValue += translate('search.filters.date.after', {date: dateAfter});
        }

        return dateValue;
    }

    if (fieldName === CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT) {
        const {lessThan, greaterThan} = filters;
        if (lessThan && greaterThan) {
            return translate('search.filters.amount.between', {
                lessThan: convertToDisplayStringWithoutCurrency(Number(lessThan)),
                greaterThan: convertToDisplayStringWithoutCurrency(Number(greaterThan)),
            });
        }
        if (lessThan) {
            return translate('search.filters.amount.lessThan', {amount: convertToDisplayStringWithoutCurrency(Number(lessThan))});
        }
        if (greaterThan) {
            return translate('search.filters.amount.greaterThan', {amount: convertToDisplayStringWithoutCurrency(Number(greaterThan))});
        }
        // Will never happen
        return;
    }

    if (
        (fieldName === CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY || fieldName === CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY || fieldName === CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG) &&
        filters[fieldName]
    ) {
        const filterArray = filters[fieldName] ?? [];
        return filterArray.sort(localeCompare).join(', ');
    }

    if (fieldName === CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION) {
        return filters[fieldName];
    }

    const filterValue = filters[fieldName];
    return Array.isArray(filterValue) ? filterValue.join(', ') : filterValue;
}

function getFilterTaxRateDisplayTitle(filters: Partial<SearchAdvancedFiltersForm>, taxRates: Record<string, string[]>) {
    const selectedTaxRateKeys = filters[CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE];
    if (!selectedTaxRateKeys) {
        return undefined;
    }

    const result: string[] = [];
    Object.entries(taxRates).forEach(([taxRateName, taxRateKeys]) => {
        if (!taxRateKeys.some((taxRateKey) => selectedTaxRateKeys.includes(taxRateKey)) || result.includes(taxRateName)) {
            return;
        }
        result.push(taxRateName);
    });

    return result.join(', ');
}

function getFilterExpenseDisplayTitle(filters: Partial<SearchAdvancedFiltersForm>, translate: LocaleContextProps['translate']) {
    const filterValue = filters[CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE];
    return filterValue
        ? Object.values(CONST.SEARCH.TRANSACTION_TYPE)
              .filter((expenseType) => filterValue.includes(expenseType))
              .map((expenseType) => translate(SearchUtils.getExpenseTypeTranslationKey(expenseType)))
              .join(', ')
        : undefined;
}

function getFilterInDisplayTitle(filters: Partial<SearchAdvancedFiltersForm>, translate: LocaleContextProps['translate'], reports?: OnyxCollection<Report>) {
    return filters.in ? filters.in.map((id) => ReportUtils.getReportName(reports?.[`${ONYXKEYS.COLLECTION.REPORT}${id}`])).join(', ') : undefined;
}
function AdvancedSearchFilters() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {singleExecution} = useSingleExecution();
    const waitForNavigate = useWaitForNavigation();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const [searchAdvancedFilters = {} as SearchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const [cardList = {}] = useOnyx(ONYXKEYS.CARD_LIST);
    const taxRates = getAllTaxRates();
    const personalDetails = usePersonalDetails();
    let currentType = searchAdvancedFilters?.type ?? CONST.SEARCH.DATA_TYPES.EXPENSE;
    if (!Object.keys(typeFiltersKeys).includes(currentType)) {
        currentType = CONST.SEARCH.DATA_TYPES.EXPENSE;
    }

    const queryString = useMemo(() => SearchUtils.buildQueryStringFromFilterFormValues(searchAdvancedFilters), [searchAdvancedFilters]);
    const queryJSON = useMemo(() => SearchUtils.buildSearchQueryJSON(queryString || SearchUtils.buildCannedSearchQuery()), [queryString]);

    const applyFiltersAndNavigate = () => {
        SearchActions.clearAllFilters();
        Navigation.dismissModal();
        Navigation.navigate(
            ROUTES.SEARCH_CENTRAL_PANE.getRoute({
                query: queryString,
            }),
        );
    };

    const onSaveSearch = () => {
        const savedSearchKeys = Object.keys(savedSearches ?? {});
        if (!queryJSON || (savedSearches && savedSearchKeys.includes(String(queryJSON.hash)))) {
            // If the search is already saved, return early to prevent unnecessary API calls
            Navigation.dismissModal();
            return;
        }

        if (isEmptyObject(savedSearches)) {
            SearchActions.showSavedSearchRenameTooltip();
        }

        SearchActions.saveSearch({
            queryJSON,
        });

        applyFiltersAndNavigate();
    };

    const filters = typeFiltersKeys[currentType].map((key) => {
        const onPress = singleExecution(waitForNavigate(() => Navigation.navigate(baseFilterConfig[key].route)));
        let filterTitle;
        if (
            key === CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE ||
            key === CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT ||
            key === CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY ||
            key === CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY ||
            key === CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION ||
            key === CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT ||
            key === CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID ||
            key === CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD ||
            key === CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG
        ) {
            filterTitle = baseFilterConfig[key].getTitle(searchAdvancedFilters, key, translate);
        } else if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID) {
            if (Object.keys(cardList).length === 0) {
                return undefined;
            }
            filterTitle = baseFilterConfig[key].getTitle(searchAdvancedFilters, cardList);
        } else if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE) {
            filterTitle = baseFilterConfig[key].getTitle(searchAdvancedFilters, taxRates);
        } else if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE) {
            filterTitle = baseFilterConfig[key].getTitle(searchAdvancedFilters, translate);
        } else if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM || key === CONST.SEARCH.SYNTAX_FILTER_KEYS.TO) {
            filterTitle = baseFilterConfig[key].getTitle(searchAdvancedFilters[key] ?? [], personalDetails);
        } else if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.IN) {
            filterTitle = baseFilterConfig[key].getTitle(searchAdvancedFilters, translate, reports);
        }
        return {
            key,
            title: filterTitle,
            description: translate(baseFilterConfig[key].description),
            onPress,
        };
    });

    const displaySearchButton = queryJSON && !SearchUtils.isCannedSearchQuery(queryJSON);

    return (
        <>
            <ScrollView contentContainerStyle={[styles.flexGrow1, styles.justifyContentBetween]}>
                <View>
                    {filters.map((filter) => {
                        if (filter === undefined) {
                            return undefined;
                        }
                        return (
                            <MenuItemWithTopDescription
                                key={filter.description}
                                title={filter.title}
                                titleStyle={styles.flex1}
                                description={filter.description}
                                shouldShowRightIcon
                                onPress={filter.onPress}
                            />
                        );
                    })}
                </View>
            </ScrollView>
            {displaySearchButton && (
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
