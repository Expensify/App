import {Str} from 'expensify-common';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScrollView from '@components/ScrollView';
import type {AdvancedFiltersKeys} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import Navigation from '@libs/Navigation/Navigation';
import * as SearchUtils from '@libs/SearchUtils';
import * as SearchActions from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {CardList} from '@src/types/onyx';

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

    if ((fieldName === CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY || fieldName === CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY) && filters[fieldName]) {
        const filterArray = filters[fieldName] ?? [];
        return filterArray.join(', ');
    }

    if (fieldName === CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION) {
        return filters[fieldName];
    }
    if (fieldName === CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID && filters[fieldName]) {
        const cards = filters[fieldName] ?? [];
        return cards.join(', ');
    }

    // Todo Once all Advanced filters are implemented this line can be cleaned up. See: https://github.com/Expensify/App/issues/45026
    // @ts-expect-error this property access is temporarily an error, because not every SYNTAX_FILTER_KEYS is handled by form.
    // When all filters are updated here: src/types/form/SearchAdvancedFiltersForm.ts this line comment + type cast can be removed.
    const filterValue = filters[fieldName] as string;
    return filterValue ? Str.recapitalize(filterValue) : undefined;
}

function getFilterCardDisplayTitle(filters: Partial<SearchAdvancedFiltersForm>, cards: CardList) {
    const filterValue = filters[CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID];
    return filterValue
        ? Object.values(cards)
              .filter((card) => filterValue.includes(card.cardID.toString()))
              .map((card) => card.bank)
              .join(', ')
        : undefined;
}

function AdvancedSearchFilters() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {singleExecution} = useSingleExecution();
    const waitForNavigate = useWaitForNavigation();

    const [searchAdvancedFilters = {}] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const [cardList = {}] = useOnyx(ONYXKEYS.CARD_LIST);

    const advancedFilters = useMemo(
        () => [
            {
                title: getFilterDisplayTitle(searchAdvancedFilters, CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE, translate),
                description: 'common.type' as const,
                route: ROUTES.SEARCH_ADVANCED_FILTERS_TYPE,
            },
            {
                title: getFilterDisplayTitle(searchAdvancedFilters, CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS, translate),
                description: 'search.filters.status' as const,
                route: ROUTES.SEARCH_ADVANCED_FILTERS_STATUS,
            },
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
        ],
        [searchAdvancedFilters, translate, cardList],
    );

    const onFormSubmit = () => {
        const query = SearchUtils.buildQueryStringFromFilters(searchAdvancedFilters);
        SearchActions.clearAdvancedFilters();
        Navigation.navigate(
            ROUTES.SEARCH_CENTRAL_PANE.getRoute({
                query,
                isCustomQuery: true,
            }),
        );
    };

    return (
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
            <FormAlertWithSubmitButton
                buttonText={translate('search.viewResults')}
                containerStyles={[styles.m4, styles.mb5]}
                onSubmit={onFormSubmit}
                enabledWhenOffline
            />
        </ScrollView>
    );
}

AdvancedSearchFilters.displayName = 'AdvancedSearchFilters';

export default AdvancedSearchFilters;
