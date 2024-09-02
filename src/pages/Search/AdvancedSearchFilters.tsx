import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'react-native-gesture-handler/lib/typescript/typeUtils';
import type {OnyxCollection} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
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
    has: {
        getTitle: getFilterHasDisplayTitle,
        description: 'search.filters.has' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_HAS,
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
    [CONST.SEARCH.DATA_TYPES.CHAT]: ['date', 'keyword', 'from', 'has', 'in'],
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
            dateValue = translate('search.filters.date.before', dateBefore);
        }
        if (dateBefore && dateAfter) {
            dateValue += ', ';
        }
        if (dateAfter) {
            dateValue += translate('search.filters.date.after', dateAfter);
        }

        return dateValue;
    }

    if (fieldName === CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT) {
        const {lessThan, greaterThan} = filters;
        if (lessThan && greaterThan) {
            return translate('search.filters.amount.between', convertToDisplayStringWithoutCurrency(Number(greaterThan)), convertToDisplayStringWithoutCurrency(Number(lessThan)));
        }
        if (lessThan) {
            return translate('search.filters.amount.lessThan', convertToDisplayStringWithoutCurrency(Number(lessThan)));
        }
        if (greaterThan) {
            return translate('search.filters.amount.greaterThan', convertToDisplayStringWithoutCurrency(Number(greaterThan)));
        }
    }

    if (
        (fieldName === CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY || fieldName === CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY || fieldName === CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG) &&
        filters[fieldName]
    ) {
        const filterArray = filters[fieldName] ?? [];
        return filterArray.join(', ');
    }

    if (fieldName === CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION) {
        return filters[fieldName];
    }

    // Todo Once all Advanced filters are implemented this line can be cleaned up. See: https://github.com/Expensify/App/issues/45026
    // @ts-expect-error this property access is temporarily an error, because not every SYNTAX_FILTER_KEYS is handled by form.
    // When all filters are updated here: src/types/form/SearchAdvancedFiltersForm.ts this line comment + type cast can be removed.
    const filterValue = filters[fieldName] as string;
    return filterValue ? Str.recapitalize(filterValue) : undefined;
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

function getFilterHasDisplayTitle(filters: Partial<SearchAdvancedFiltersForm>, translate: LocaleContextProps['translate']) {
    const filterValue = filters[CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS];
    return filterValue
        ? Object.values(CONST.SEARCH.CHAT_TYPES)
              .filter((hasFilter) => filterValue.includes(hasFilter))
              .map((hasFilter) => translate(SearchUtils.getChatFiltersTranslationKey(hasFilter)))
              .join(', ')
        : undefined;
}

function AdvancedSearchFilters() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {singleExecution} = useSingleExecution();
    const waitForNavigate = useWaitForNavigation();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);

    const [searchAdvancedFilters = {} as SearchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const [cardList = {}] = useOnyx(ONYXKEYS.CARD_LIST);
    const taxRates = getAllTaxRates();
    const personalDetails = usePersonalDetails();

    // const advancedFilters = useMemo(
    //     () => [
    //         {
    //             title: getFilterDisplayTitle(searchAdvancedFilters, CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE, translate),
    //             description: 'common.date' as const,
    //             route: ROUTES.SEARCH_ADVANCED_FILTERS_DATE,
    //         },
    //         {
    //             title: getFilterDisplayTitle(searchAdvancedFilters, CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY, translate),
    //             description: 'common.currency' as const,
    //             route: ROUTES.SEARCH_ADVANCED_FILTERS_CURRENCY,
    //         },
    //         {
    //             title: getFilterDisplayTitle(searchAdvancedFilters, CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT, translate),
    //             description: 'common.merchant' as const,
    //             route: ROUTES.SEARCH_ADVANCED_FILTERS_MERCHANT,
    //         },
    //         {
    //             title: getFilterDisplayTitle(searchAdvancedFilters, CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION, translate),
    //             description: 'common.description' as const,
    //             route: ROUTES.SEARCH_ADVANCED_FILTERS_DESCRIPTION,
    //         },
    //         {
    //             title: getFilterDisplayTitle(searchAdvancedFilters, CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID, translate),
    //             description: 'common.reportID' as const,
    //             route: ROUTES.SEARCH_ADVANCED_FILTERS_REPORT_ID,
    //         },
    //         {
    //             title: getFilterDisplayTitle(searchAdvancedFilters, CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT, translate),
    //             description: 'common.total' as const,
    //             route: ROUTES.SEARCH_ADVANCED_FILTERS_AMOUNT,
    //         },
    //         {
    //             title: getFilterDisplayTitle(searchAdvancedFilters, CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY, translate),
    //             description: 'common.category' as const,
    //             route: ROUTES.SEARCH_ADVANCED_FILTERS_CATEGORY,
    //         },
    //         {
    //             title: getFilterDisplayTitle(searchAdvancedFilters, CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD, translate),
    //             description: 'search.filters.hasKeywords' as const,
    //             route: ROUTES.SEARCH_ADVANCED_FILTERS_KEYWORD,
    //         },
    //         {
    //             title: getFilterCardDisplayTitle(searchAdvancedFilters, cardList),
    //             description: 'common.card' as const,
    //             route: ROUTES.SEARCH_ADVANCED_FILTERS_CARD,
    //             shouldHide: Object.keys(cardList).length === 0,
    //         },
    //         {
    //             title: getFilterTaxRateDisplayTitle(searchAdvancedFilters, taxRates),
    //             description: 'workspace.taxes.taxRate' as const,
    //             route: ROUTES.SEARCH_ADVANCED_FILTERS_TAX_RATE,
    //         },
    //         {
    //             title: getFilterExpenseDisplayTitle(searchAdvancedFilters, translate),
    //             description: 'search.expenseType' as const,
    //             route: ROUTES.SEARCH_ADVANCED_FILTERS_EXPENSE_TYPE,
    //         },
    //         {
    //             title: getFilterDisplayTitle(searchAdvancedFilters, CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG, translate),
    //             description: 'common.tag' as const,
    //             route: ROUTES.SEARCH_ADVANCED_FILTERS_TAG,
    //         },
    //         {
    //             title: getFilterParticipantDisplayTitle(searchAdvancedFilters.from ?? [], personalDetails),
    //             description: 'common.from' as const,
    //             route: ROUTES.SEARCH_ADVANCED_FILTERS_FROM,
    //         },
    //         {
    //             title: getFilterParticipantDisplayTitle(searchAdvancedFilters.to ?? [], personalDetails),
    //             description: 'common.to' as const,
    //             route: ROUTES.SEARCH_ADVANCED_FILTERS_TO,
    //         },
    //         {
    //             title: getFilterInDisplayTitle(searchAdvancedFilters, translate, reports),
    //             description: 'common.in' as const,
    //             route: ROUTES.SEARCH_ADVANCED_FILTERS_IN,
    //         },
    //     ],
    //     [searchAdvancedFilters, translate, cardList, taxRates, personalDetails, reports],
    // );
    const currentType = searchAdvancedFilters?.type ?? CONST.SEARCH.DATA_TYPES.EXPENSE;

    const onFormSubmit = () => {
        const query = SearchUtils.buildQueryStringFromFilters(searchAdvancedFilters);
        SearchActions.clearAdvancedFilters();
        Navigation.dismissModal();
        Navigation.navigate(
            ROUTES.SEARCH_CENTRAL_PANE.getRoute({
                query,
                isCustomQuery: true,
            }),
        );
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
        } else if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE || key === CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS) {
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
                                description={filter.description}
                                shouldShowRightIcon
                                onPress={filter.onPress}
                            />
                        );
                    })}
                </View>
            </ScrollView>
            <FormAlertWithSubmitButton
                buttonText={translate('search.viewResults')}
                containerStyles={[styles.m4, styles.mb5]}
                onSubmit={onFormSubmit}
                enabledWhenOffline
            />
        </>
    );
}

AdvancedSearchFilters.displayName = 'AdvancedSearchFilters';

export default AdvancedSearchFilters;
