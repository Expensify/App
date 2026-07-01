import React from 'react';
import type {ReactNode} from 'react';
import {ListFilterHeightContextProvider} from '@components/Search/FilterComponents/ListFilterHeightContext';
import AmountPopup from '@components/Search/FilterDropdowns/AmountPopup';
import CommonPopup from '@components/Search/FilterDropdowns/CommonPopup';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
import ReportFieldPopup from '@components/Search/FilterDropdowns/ReportFieldPopup';
import useUpdateFilterQuery from '@components/Search/hooks/useUpdateFilterQuery';
import {useSearchResultsContext} from '@components/Search/SearchContext';
import type {ReportFieldKey, SearchFilterKey, SearchQueryJSON} from '@components/Search/types';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {close} from '@libs/actions/Modal';
import {setSearchContext} from '@libs/actions/Search';
import {getAdvancedFiltersToReset} from '@libs/SearchQueryUtils';
import {FILTER_VIEW_MAP, getFilterNegatableValue, isAmountFilterKey, isDateFilterKey, mapFiltersFormToLabelValueList, SKIPPED_SEARCH_FILTERS} from '@libs/SearchUIUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {SearchAdvancedFiltersKey} from '@src/types/form/SearchAdvancedFiltersForm';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import DatePickerFilterPopup from './DatePickerFilterPopup';

type FilterItem = WithSentryLabel & {
    PopoverComponent: (props: PopoverComponentProps) => ReactNode;
    onClosePress: () => void;
};

type UseSearchFiltersBarResult = {
    filters: Array<SearchFilter & FilterItem>;
    hasErrors: boolean;
    shouldShowFiltersBarLoading: boolean;
    clearFilters: () => void;
};

type FilterPopupProps = {
    filterKey: SearchFilter['key'];
    searchAdvancedFiltersForm: Partial<SearchAdvancedFiltersForm>;
    closeOverlay: () => void;
    setPopoverWidth: PopoverComponentProps['setPopoverWidth'];
    updateFilterForm: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

function getFilterSentryLabel(filterKey: SearchAdvancedFiltersKey | SearchFilterKey | ReportFieldKey) {
    return `Search-Filter-${filterKey}`;
}

function FilterPopup({filterKey, searchAdvancedFiltersForm, closeOverlay, setPopoverWidth, updateFilterForm}: FilterPopupProps) {
    const {translate} = useLocalize();
    const label = translate(FILTER_VIEW_MAP[filterKey].labelKey);

    const closeModalAndUpdateFilterForm = (values: Partial<SearchAdvancedFiltersForm>) => {
        close(() => updateFilterForm(values));
    };

    if (isAmountFilterKey(filterKey)) {
        const value = {
            [CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO]: searchAdvancedFiltersForm[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO}`],
            [CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN]: searchAdvancedFiltersForm[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}`],
            [CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN]: searchAdvancedFiltersForm[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}`],
        };
        return (
            <AmountPopup
                filterKey={filterKey}
                value={value}
                closeOverlay={closeOverlay}
                label={label}
                updateFilterForm={closeModalAndUpdateFilterForm}
            />
        );
    }

    if (isDateFilterKey(filterKey)) {
        const value = {
            [CONST.SEARCH.DATE_MODIFIERS.ON]: searchAdvancedFiltersForm[`${filterKey}${CONST.SEARCH.DATE_MODIFIERS.ON}`],
            [CONST.SEARCH.DATE_MODIFIERS.AFTER]: searchAdvancedFiltersForm[`${filterKey}${CONST.SEARCH.DATE_MODIFIERS.AFTER}`],
            [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: searchAdvancedFiltersForm[`${filterKey}${CONST.SEARCH.DATE_MODIFIERS.BEFORE}`],
            [CONST.SEARCH.DATE_MODIFIERS.RANGE]: searchAdvancedFiltersForm[`${filterKey}${CONST.SEARCH.DATE_MODIFIERS.RANGE}`],
        };
        return (
            <DatePickerFilterPopup
                closeOverlay={closeOverlay}
                setPopoverWidth={setPopoverWidth}
                filterKey={filterKey}
                value={value}
                label={label}
                hasFeed={!!searchAdvancedFiltersForm.feed}
                updateFilterForm={closeModalAndUpdateFilterForm}
            />
        );
    }

    if (filterKey === CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX) {
        return (
            <ReportFieldPopup
                values={searchAdvancedFiltersForm}
                closeOverlay={closeOverlay}
                updateFilterForm={closeModalAndUpdateFilterForm}
            />
        );
    }

    return (
        <CommonPopup
            filterKey={filterKey}
            value={searchAdvancedFiltersForm[filterKey]}
            type={searchAdvancedFiltersForm.type}
            policyID={getFilterNegatableValue(CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID, searchAdvancedFiltersForm)}
            label={label}
            closeOverlay={closeOverlay}
            updateFilterForm={closeModalAndUpdateFilterForm}
        />
    );
}

function useSearchFiltersBar(queryJSON: SearchQueryJSON): UseSearchFiltersBarResult {
    const [searchAdvancedFiltersForm = getEmptyObject<Partial<SearchAdvancedFiltersForm>>()] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const {translate, localeCompare} = useLocalize();
    const {isOffline} = useNetwork();
    const {convertToDisplayStringWithoutCurrency} = useCurrencyListActions();
    const {shouldShowFiltersBarLoading, currentSearchResults} = useSearchResultsContext();
    const {setFilterQueryParams, updateFilterQueryParams} = useUpdateFilterQuery(queryJSON);
    const filters = mapFiltersFormToLabelValueList<FilterItem>(
        searchAdvancedFiltersForm,
        SKIPPED_SEARCH_FILTERS,
        translate,
        localeCompare,
        convertToDisplayStringWithoutCurrency,
        (filterKey) => ({
            PopoverComponent: ({closeOverlay, setPopoverWidth}) => (
                <ListFilterHeightContextProvider>
                    <FilterPopup
                        filterKey={filterKey}
                        searchAdvancedFiltersForm={searchAdvancedFiltersForm}
                        closeOverlay={closeOverlay}
                        setPopoverWidth={setPopoverWidth}
                        updateFilterForm={updateFilterQueryParams}
                    />
                </ListFilterHeightContextProvider>
            ),
            sentryLabel: getFilterSentryLabel(filterKey),
            onClosePress: () => {
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
                        if (curr.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)) {
                            acc[curr as SearchAdvancedFiltersKey] = undefined;
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

    const clearFilters = () => {
        setFilterQueryParams(getAdvancedFiltersToReset(searchAdvancedFiltersForm ?? {}));
        setSearchContext(false);
    };

    return {
        filters,
        hasErrors: Object.keys(currentSearchResults?.errors ?? {}).length > 0 && !isOffline,
        shouldShowFiltersBarLoading,
        clearFilters,
    };
}

export default useSearchFiltersBar;
export type {FilterItem};
