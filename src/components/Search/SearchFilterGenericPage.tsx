import React from 'react';
import {useRoute, type RouteProp} from '@react-navigation/native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import SearchBooleanFilterBasePage from '@components/Search/SearchBooleanFilterBasePage';
import SearchDatePresetFilterBasePage from '@components/Search/SearchDatePresetFilterBasePage';
import SearchFilterTextInput from '@components/Search/Filters/SearchFilterTextInput';
import SearchFilterSingleSelect from '@components/Search/Filters/SearchFilterSingleSelect';
import SearchFilterMultiSelect from '@components/Search/Filters/SearchFilterMultiSelect';
import {getFilterConfig} from '@libs/SearchFilters/filterConfig';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {getStatusOptions} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {SearchFilterKey} from '@components/Search/types';
import type {NavigatorScreenParams} from '@react-navigation/native';

type SearchFilterGenericPageProps = {
    /** The filter key being edited */
    filterKey?: SearchFilterKey;
};

type RouteParams = {
    filterKey?: SearchFilterKey;
};

function SearchFilterGenericPage({filterKey: propFilterKey}: SearchFilterGenericPageProps) {
    const route = useRoute<RouteProp<{params: RouteParams}, 'params'>>();
    const filterKey = propFilterKey || route.params?.filterKey;
    
    const {translate} = useLocalize();
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
    
    if (!filterKey) {
        return <FullPageNotFoundView shouldShow />;
    }

    const filterConfig = getFilterConfig(filterKey);

    if (!filterConfig) {
        return <FullPageNotFoundView shouldShow />;
    }

    // For DatePicker components, use existing SearchDatePresetFilterBasePage
    if (filterConfig.component === 'DatePicker') {
        return (
            <SearchDatePresetFilterBasePage
                dateKey={filterKey as CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE}
                titleKey={filterConfig.titleKey}
            />
        );
    }

    // For Boolean components, use existing SearchBooleanFilterBasePage
    if (filterConfig.component === 'Boolean') {
        return (
            <SearchBooleanFilterBasePage
                booleanKey={filterKey as any}
                titleKey={filterConfig.titleKey}
            />
        );
    }

    // For TextInput components
    if (filterConfig.component === 'TextInput') {
        return (
            <SearchFilterTextInput
                filterKey={filterKey}
                titleKey={filterConfig.titleKey}
                labelKey={filterConfig.titleKey}
            />
        );
    }

    // For SingleSelect components
    if (filterConfig.component === 'SingleSelect') {
        let options: Array<{text: string; value: string}> = [];

        // Generate options based on filter type
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE) {
            options = Object.values(CONST.SEARCH.DATA_TYPES).map(type => ({
                text: translate(`common.${type}`),
                value: type,
            }));
        } else if (filterKey === CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY) {
            options = Object.values(CONST.SEARCH.GROUP_BY).map(groupBy => ({
                text: translate(`search.filters.groupBy.${groupBy}`),
                value: groupBy,
            }));
        } else if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE) {
            options = Object.values(CONST.SEARCH.WITHDRAWAL_TYPE).map(type => ({
                text: translate(`search.filters.withdrawalType.${type}`),
                value: type,
            }));
        }

        return (
            <SearchFilterSingleSelect
                filterKey={filterKey}
                titleKey={filterConfig.titleKey}
                options={options}
            />
        );
    }

    // For MultiSelect components
    if (filterConfig.component === 'MultiSelect') {
        let options: Array<{text: string; value: string}> = [];

        // Generate options based on filter type
        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS) {
            const currentType = searchAdvancedFiltersForm?.type ?? CONST.SEARCH.DATA_TYPES.EXPENSE;
            const currentGroupBy = searchAdvancedFiltersForm?.groupBy;
            options = getStatusOptions(currentType, currentGroupBy);
        } else if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY || filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY) {
            // For currency, you'd need to fetch available currencies
            options = Object.keys(CONST.CURRENCY).map(currency => ({
                text: currency,
                value: currency,
            }));
        } else if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE) {
            options = Object.values(CONST.SEARCH.TRANSACTION_TYPE).map(type => ({
                text: translate(`search.expenseType.${type}`),
                value: type,
            }));
        }

        return (
            <SearchFilterMultiSelect
                filterKey={filterKey}
                titleKey={filterConfig.titleKey}
                options={options}
                defaultValue={filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS ? CONST.SEARCH.STATUS.EXPENSE.ALL : undefined}
            />
        );
    }

    // For other component types, we'll need to implement them later
    // For now, show not found
    return <FullPageNotFoundView shouldShow />;
}

SearchFilterGenericPage.displayName = 'SearchFilterGenericPage';

export default SearchFilterGenericPage;