import {Str} from 'expensify-common';
import React, {useMemo} from 'react';
import {View} from 'react-native';
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
import * as SearchUtils from '@libs/SearchUtils';
import * as SearchActions from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {CardList, PersonalDetailsList} from '@src/types/onyx';

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

function getExpenseTypeDisplayTitle(filters: Partial<SearchAdvancedFiltersForm>, translate: LocaleContextProps['translate']) {
    const filterValue = filters[CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE];
    return filterValue
        ? Object.values(CONST.SEARCH.TRANSACTION_TYPE)
              .filter((expenseType) => filterValue.includes(expenseType))
              .map((expenseType) => translate(SearchUtils.getExpenseTypeTranslationKey(expenseType)))
              .join(', ')
        : undefined;
}

function AdvancedSearchFilters() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {singleExecution} = useSingleExecution();
    const waitForNavigate = useWaitForNavigation();

    const [searchAdvancedFilters = {} as SearchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const [cardList = {}] = useOnyx(ONYXKEYS.CARD_LIST);
    const taxRates = getAllTaxRates();
    const personalDetails = usePersonalDetails();

    const advancedFilters = useMemo(
        () => [
            {
                title: getFilterDisplayTitle(searchAdvancedFilters, CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE, translate),
                description: 'common.date' as const,
                route: ROUTES.SEARCH_ADVANCED_FILTERS_DATE,
            },
            {
                title: getFilterDisplayTitle(searchAdvancedFilters, CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY, translate),
                description: 'common.currency' as const,
                route: ROUTES.SEARCH_ADVANCED_FILTERS_CURRENCY,
            },
            {
                title: getFilterDisplayTitle(searchAdvancedFilters, CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT, translate),
                description: 'common.merchant' as const,
                route: ROUTES.SEARCH_ADVANCED_FILTERS_MERCHANT,
            },
            {
                title: getFilterDisplayTitle(searchAdvancedFilters, CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION, translate),
                description: 'common.description' as const,
                route: ROUTES.SEARCH_ADVANCED_FILTERS_DESCRIPTION,
            },
            {
                title: getFilterDisplayTitle(searchAdvancedFilters, CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID, translate),
                description: 'common.reportID' as const,
                route: ROUTES.SEARCH_ADVANCED_FILTERS_REPORT_ID,
            },
            {
                title: getFilterDisplayTitle(searchAdvancedFilters, CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT, translate),
                description: 'common.total' as const,
                route: ROUTES.SEARCH_ADVANCED_FILTERS_AMOUNT,
            },
            {
                title: getFilterDisplayTitle(searchAdvancedFilters, CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY, translate),
                description: 'common.category' as const,
                route: ROUTES.SEARCH_ADVANCED_FILTERS_CATEGORY,
            },
            {
                title: getFilterDisplayTitle(searchAdvancedFilters, CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD, translate),
                description: 'search.filters.hasKeywords' as const,
                route: ROUTES.SEARCH_ADVANCED_FILTERS_KEYWORD,
            },
            {
                title: getFilterCardDisplayTitle(searchAdvancedFilters, cardList),
                description: 'common.card' as const,
                route: ROUTES.SEARCH_ADVANCED_FILTERS_CARD,
                shouldHide: Object.keys(cardList).length === 0,
            },
            {
                title: getFilterTaxRateDisplayTitle(searchAdvancedFilters, taxRates),
                description: 'workspace.taxes.taxRate' as const,
                route: ROUTES.SEARCH_ADVANCED_FILTERS_TAX_RATE,
            },
            {
                title: getExpenseTypeDisplayTitle(searchAdvancedFilters, translate),
                description: 'search.expenseType' as const,
                route: ROUTES.SEARCH_ADVANCED_FILTERS_EXPENSE_TYPE,
            },
            {
                title: getFilterDisplayTitle(searchAdvancedFilters, CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG, translate),
                description: 'common.tag' as const,
                route: ROUTES.SEARCH_ADVANCED_FILTERS_TAG,
            },
            {
                title: getFilterParticipantDisplayTitle(searchAdvancedFilters.from ?? [], personalDetails),
                description: 'common.from' as const,
                route: ROUTES.SEARCH_ADVANCED_FILTERS_FROM,
            },
            {
                title: getFilterParticipantDisplayTitle(searchAdvancedFilters.to ?? [], personalDetails),
                description: 'common.to' as const,
                route: ROUTES.SEARCH_ADVANCED_FILTERS_TO,
            },
        ],
        [searchAdvancedFilters, translate, cardList, taxRates, personalDetails],
    );

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

    return (
        <>
            <ScrollView contentContainerStyle={[styles.flexGrow1, styles.justifyContentBetween]}>
                <View>
                    {advancedFilters.map((item) => {
                        const onPress = singleExecution(waitForNavigate(() => Navigation.navigate(item.route)));
                        if (item.shouldHide) {
                            return undefined;
                        }
                        return (
                            <MenuItemWithTopDescription
                                key={item.description}
                                title={item.title}
                                description={translate(item.description)}
                                shouldShowRightIcon
                                onPress={onPress}
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
