import {ListFilterHeightContextProvider} from '@components/Search/FilterComponents/ListFilterHeightContext';
import AmountPopup from '@components/Search/FilterDropdowns/AmountPopup';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
import ListPopup from '@components/Search/FilterDropdowns/ListPopup';
import ReportFieldPopup from '@components/Search/FilterDropdowns/ReportFieldPopup';
import TextFilterPopup from '@components/Search/FilterDropdowns/TextFilterPopup';
import useUpdateFilterQuery from '@components/Search/hooks/useUpdateFilterQuery';
import {useSearchQueryContext, useSearchResultsContext} from '@components/Search/SearchContext';
import type {SearchFilterKey, SearchQueryJSON} from '@components/Search/types';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {shouldShowInitialCategoryFilterLoading} from '@hooks/useSearchFilterSync';

import {close} from '@libs/actions/Modal';
import {setSearchContext} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {buildQueryStringWithResetFilters, hasFiltersChangedFromDefault, removeNegation} from '@libs/SearchQueryUtils';
import {FILTER_VIEW_MAP, isAmountFilterKey, isDateFilterKey, isReportFieldKey, isTextFilterKey, mapFiltersFormToLabelValueList, SKIPPED_SEARCH_FILTERS} from '@libs/SearchUIUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {SearchAdvancedFiltersKey} from '@src/types/form/SearchAdvancedFiltersForm';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

import type {ReactNode} from 'react';

import React from 'react';

import DatePickerFilterPopup from './DatePickerFilterPopup';

type FilterItem = WithSentryLabel & {
    PopoverComponent: (props: PopoverComponentProps) => ReactNode;
    onClosePress: (() => void) | undefined;
};

type UseSearchFiltersBarResult = {
    filters: Array<SearchFilter & FilterItem>;
    hasErrors: boolean;
    shouldShowFiltersBarLoading: boolean;
    shouldShowResetFilters: boolean;
    resetFilters: () => void;
};

type FilterPopupProps = {
    baseFilterKey: SearchFilter['key'];
    isDefault: boolean;
    searchAdvancedFiltersForm: Partial<SearchAdvancedFiltersForm>;
    closeOverlay: () => void;
    setPopoverWidth: PopoverComponentProps['setPopoverWidth'];
    updateFilterForm: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

function getFilterSentryLabel(filterKey: SearchAdvancedFiltersKey | SearchFilterKey) {
    return `Search-Filter-${filterKey}`;
}

function FilterPopup({baseFilterKey, isDefault, searchAdvancedFiltersForm, closeOverlay, setPopoverWidth, updateFilterForm}: FilterPopupProps) {
    const {translate} = useLocalize();
    const label = translate(FILTER_VIEW_MAP[baseFilterKey].labelKey);

    const closeModalAndUpdateFilterForm = (values: Partial<SearchAdvancedFiltersForm>) => {
        close(() => updateFilterForm(values));
    };

    if (isAmountFilterKey(baseFilterKey)) {
        const value = {
            [CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO]: searchAdvancedFiltersForm[`${baseFilterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO}`],
            [CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN]: searchAdvancedFiltersForm[`${baseFilterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}`],
            [CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN]: searchAdvancedFiltersForm[`${baseFilterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}`],
        };
        return (
            <AmountPopup
                baseFilterKey={baseFilterKey}
                value={value}
                closeOverlay={closeOverlay}
                label={label}
                updateFilterForm={closeModalAndUpdateFilterForm}
            />
        );
    }

    if (isDateFilterKey(baseFilterKey)) {
        const value = {
            [CONST.SEARCH.DATE_MODIFIERS.ON]: searchAdvancedFiltersForm[`${baseFilterKey}${CONST.SEARCH.DATE_MODIFIERS.ON}`],
            [CONST.SEARCH.DATE_MODIFIERS.AFTER]: searchAdvancedFiltersForm[`${baseFilterKey}${CONST.SEARCH.DATE_MODIFIERS.AFTER}`],
            [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: searchAdvancedFiltersForm[`${baseFilterKey}${CONST.SEARCH.DATE_MODIFIERS.BEFORE}`],
            [CONST.SEARCH.DATE_MODIFIERS.RANGE]: searchAdvancedFiltersForm[`${baseFilterKey}${CONST.SEARCH.DATE_MODIFIERS.RANGE}`],
        };
        return (
            <DatePickerFilterPopup
                closeOverlay={closeOverlay}
                setPopoverWidth={setPopoverWidth}
                baseFilterKey={baseFilterKey}
                value={value}
                label={label}
                hasFeed={!!searchAdvancedFiltersForm.feed}
                updateFilterForm={closeModalAndUpdateFilterForm}
            />
        );
    }

    if (baseFilterKey === CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX) {
        return (
            <ReportFieldPopup
                values={searchAdvancedFiltersForm}
                closeOverlay={closeOverlay}
                updateFilterForm={closeModalAndUpdateFilterForm}
            />
        );
    }

    if (isTextFilterKey(baseFilterKey)) {
        return (
            <TextFilterPopup
                key={baseFilterKey}
                baseFilterKey={baseFilterKey}
                values={searchAdvancedFiltersForm}
                label={label}
                closeOverlay={closeOverlay}
                updateFilterForm={closeModalAndUpdateFilterForm}
            />
        );
    }

    return (
        <ListPopup
            baseFilterKey={baseFilterKey}
            isDefault={isDefault}
            values={searchAdvancedFiltersForm}
            label={label}
            closeOverlay={closeOverlay}
            updateFilterForm={closeModalAndUpdateFilterForm}
        />
    );
}

function useSearchFiltersBar(queryJSON: SearchQueryJSON): UseSearchFiltersBarResult {
    const [searchAdvancedFiltersForm = getEmptyObject<Partial<SearchAdvancedFiltersForm>>()] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const [areCategoriesLoaded] = useOnyx(ONYXKEYS.IS_SEARCH_FILTERS_CATEGORY_DATA_LOADED);
    const [isLoadingCategories] = useOnyx(ONYXKEYS.RAM_ONLY_IS_LOADING_SEARCH_FILTERS_CATEGORY_DATA);
    const {translate, localeCompare, dateFnsLocale} = useLocalize();
    const {isOffline} = useNetwork();
    const {convertToDisplayStringWithoutCurrency} = useCurrencyListActions();
    const {shouldShowFiltersBarLoading, currentSearchResults} = useSearchResultsContext();
    const {currentSearchQueryJSON, currentDefaultSearchQueryJSON, currentDefaultSearchQueryFilterKeys} = useSearchQueryContext();
    const {updateFilterQueryParams} = useUpdateFilterQuery(queryJSON);
    const filters = mapFiltersFormToLabelValueList(
        searchAdvancedFiltersForm,
        currentDefaultSearchQueryFilterKeys,
        SKIPPED_SEARCH_FILTERS,
        translate,
        dateFnsLocale,
        localeCompare,
        convertToDisplayStringWithoutCurrency,
        (filterKey, isDefault): FilterItem => ({
            PopoverComponent: ({closeOverlay, setPopoverWidth}) => (
                <ListFilterHeightContextProvider>
                    <FilterPopup
                        baseFilterKey={removeNegation(filterKey)}
                        isDefault={isDefault}
                        searchAdvancedFiltersForm={searchAdvancedFiltersForm}
                        closeOverlay={closeOverlay}
                        setPopoverWidth={setPopoverWidth}
                        updateFilterForm={updateFilterQueryParams}
                    />
                </ListFilterHeightContextProvider>
            ),
            sentryLabel: getFilterSentryLabel(filterKey),
            onClosePress: isDefault
                ? undefined
                : () => {
                      if (isAmountFilterKey(filterKey)) {
                          const equalToKey = `${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO}`;
                          const greaterThanKey = `${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}`;
                          const lessThanKey = `${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}`;
                          updateFilterQueryParams({[equalToKey]: undefined, [greaterThanKey]: undefined, [lessThanKey]: undefined});
                          return;
                      }

                      if (isDateFilterKey(filterKey)) {
                          const onKey = `${filterKey}${CONST.SEARCH.DATE_MODIFIERS.ON}`;
                          const beforeKey = `${filterKey}${CONST.SEARCH.DATE_MODIFIERS.BEFORE}`;
                          const afterKey = `${filterKey}${CONST.SEARCH.DATE_MODIFIERS.AFTER}`;
                          const rangeKey = `${filterKey}${CONST.SEARCH.DATE_MODIFIERS.RANGE}`;
                          updateFilterQueryParams({[onKey]: undefined, [beforeKey]: undefined, [afterKey]: undefined, [rangeKey]: undefined});
                          return;
                      }

                      if (filterKey === CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX) {
                          const formValues = Object.keys(searchAdvancedFiltersForm).reduce((acc, curr) => {
                              if (isReportFieldKey(curr)) {
                                  acc[curr] = undefined;
                              }
                              return acc;
                          }, {} as Partial<SearchAdvancedFiltersForm>);
                          updateFilterQueryParams(formValues);
                          return;
                      }

                      updateFilterQueryParams({[filterKey]: undefined});
                  },
        }),
    );

    const resetFilters = () => {
        if (!currentSearchQueryJSON) {
            return;
        }

        Navigation.setParams({q: buildQueryStringWithResetFilters(currentSearchQueryJSON, currentDefaultSearchQueryJSON), rawQuery: undefined});
        setSearchContext(false);
    };
    const isCategoryFilterLoading = shouldShowInitialCategoryFilterLoading(queryJSON, areCategoriesLoaded, isLoadingCategories, isOffline);

    return {
        filters,
        hasErrors: Object.keys(currentSearchResults?.errors ?? {}).length > 0 && !isOffline,
        shouldShowFiltersBarLoading: shouldShowFiltersBarLoading || isCategoryFilterLoading,
        shouldShowResetFilters:
            currentDefaultSearchQueryJSON && currentSearchQueryJSON ? hasFiltersChangedFromDefault(currentSearchQueryJSON, currentDefaultSearchQueryJSON) : filters.length > 0,
        resetFilters,
    };
}

export default useSearchFiltersBar;
export type {FilterItem};
