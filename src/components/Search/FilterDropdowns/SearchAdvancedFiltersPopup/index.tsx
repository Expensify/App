import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import SafeTriangle from '@components/SafeTriangle';
import FilterList from '@components/Search/FilterComponents/AdvancedFilters/FilterList';
import SearchAdvancedFiltersContent from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import useUpdateFilterQuery from '@components/Search/hooks/useUpdateFilterQuery';
import type {SearchQueryJSON} from '@components/Search/types';

import useAdvancedSearchFilters from '@hooks/useAdvancedSearchFilters';
import useDebouncedState from '@hooks/useDebouncedState';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {getFilterNegatableValue} from '@libs/SearchUIUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {Activity, Suspense, useRef} from 'react';
import {View} from 'react-native';

import AmountFilterContentPopupWrapper from './AmountFilterContentPopupWrapper';
import DateFilterContentPopupWrapper from './DateFilterContentPopupWrapper';
import ListFilterContentPopupWrapper from './ListFilterContentPopupWrapper';
import ReportFieldFilterContentPopupWrapper from './ReportFieldFilterContentPopupWrapper';
import TextInputFilterContentPopupWrapper from './TextInputFilterContentPopupWrapper';

type SearchAdvancedFiltersPopupProps = {
    queryJSON: SearchQueryJSON;
};

const filterComponents = {
    List: ListFilterContentPopupWrapper,
    Text: TextInputFilterContentPopupWrapper,
    Amount: AmountFilterContentPopupWrapper,
    Date: DateFilterContentPopupWrapper,
    ReportField: ReportFieldFilterContentPopupWrapper,
} as const;

function SearchAdvancedFiltersPopup({queryJSON}: SearchAdvancedFiltersPopupProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowHeight} = useWindowDimensions();
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const initialFilter = CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE;
    const [hoveredFilter, activeFilter, hoverFilter, setActiveFilter, cancelPendingFilter] = useDebouncedState<SearchFilter['key']>(
        initialFilter,
        CONST.TIMING.SEARCH_FILTER_HOVER_INTENT_DELAY,
    );
    const policyID = getFilterNegatableValue(CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID, searchAdvancedFiltersForm);
    const filterKeys = useAdvancedSearchFilters(searchAdvancedFiltersForm?.type, policyID);
    const availableFilters = filterKeys.flat();
    const filterContentRef = useRef<View>(null);
    const {updateFilterQueryParams} = useUpdateFilterQuery(queryJSON);
    const focusFilter = (filterKey: SearchFilter['key']) => {
        cancelPendingFilter();
        hoverFilter(filterKey);
        setActiveFilter(filterKey);
    };

    const renderFilter = (filterKey: SearchFilter['key']) => {
        if (!availableFilters.includes(filterKey)) {
            return null;
        }

        return (
            <Activity mode={filterKey === activeFilter ? 'visible' : 'hidden'}>
                <SearchAdvancedFiltersContent
                    values={searchAdvancedFiltersForm}
                    baseFilterKey={filterKey}
                    components={filterComponents}
                    onChange={updateFilterQueryParams}
                />
            </Activity>
        );
    };

    const FILTER_KEYS = CONST.SEARCH.SYNTAX_FILTER_KEYS;

    return (
        <SafeTriangle submenuRef={filterContentRef}>
            <View style={[styles.flexRow, StyleUtils.getHeight(Math.min(windowHeight, CONST.ADVANCED_FILTERS_POPOVER_HEIGHT))]}>
                <FilterList
                    style={[styles.typeFiltersPopupContainer]}
                    filterKeys={filterKeys}
                    selectedFilter={hoveredFilter}
                    onHoverIn={hoverFilter}
                    onFocus={focusFilter}
                />
                <View
                    ref={filterContentRef}
                    style={[styles.filterContentContainer]}
                >
                    <Suspense
                        fallback={
                            <OptionsListSkeletonView
                                fixedNumItems={6}
                                shouldAnimate
                            />
                        }
                    >
                        {renderFilter(FILTER_KEYS.TYPE)}
                        {renderFilter(FILTER_KEYS.STATUS)}
                        {renderFilter(FILTER_KEYS.FROM)}
                        {renderFilter(FILTER_KEYS.TO)}
                        {renderFilter(FILTER_KEYS.POLICY_ID)}
                        {renderFilter(FILTER_KEYS.EXPENSE_TYPE)}
                        {renderFilter(FILTER_KEYS.DATE)}
                        {renderFilter(FILTER_KEYS.AMOUNT)}
                        {renderFilter(FILTER_KEYS.CURRENCY)}
                        {renderFilter(FILTER_KEYS.MERCHANT)}
                        {renderFilter(FILTER_KEYS.DESCRIPTION)}
                        {renderFilter(FILTER_KEYS.CATEGORY)}
                        {renderFilter(FILTER_KEYS.TAG)}
                        {renderFilter(FILTER_KEYS.TAX_RATE)}
                        {renderFilter(FILTER_KEYS.ATTENDEE)}
                        {renderFilter(FILTER_KEYS.REIMBURSABLE)}
                        {renderFilter(FILTER_KEYS.BILLABLE)}
                        {renderFilter(FILTER_KEYS.CARD_ID)}
                        {renderFilter(FILTER_KEYS.BANK_ACCOUNT)}
                        {renderFilter(FILTER_KEYS.FEED)}
                        {renderFilter(FILTER_KEYS.PURCHASE_AMOUNT)}
                        {renderFilter(FILTER_KEYS.PURCHASE_CURRENCY)}
                        {renderFilter(FILTER_KEYS.RECEIPT_TYPE)}
                        {renderFilter(FILTER_KEYS.REPORT_ID)}
                        {renderFilter(FILTER_KEYS.REPORT_FIELD)}
                        {renderFilter(FILTER_KEYS.SUBMITTER_USER_ID)}
                        {renderFilter(FILTER_KEYS.SUBMITTER_PAYROLL_ID)}
                        {renderFilter(FILTER_KEYS.ORDER_DEAL_NUMBERS)}
                        {renderFilter(FILTER_KEYS.HAS)}
                        {renderFilter(FILTER_KEYS.KEYWORD)}
                        {renderFilter(FILTER_KEYS.SUBMITTED)}
                        {renderFilter(FILTER_KEYS.APPROVED)}
                        {renderFilter(FILTER_KEYS.EXPORTED)}
                        {renderFilter(FILTER_KEYS.EXPORTED_TO)}
                        {renderFilter(FILTER_KEYS.PAID)}
                        {renderFilter(FILTER_KEYS.POSTED)}
                        {renderFilter(FILTER_KEYS.WITHDRAWAL_ID)}
                        {renderFilter(FILTER_KEYS.WITHDRAWAL_TYPE)}
                        {renderFilter(FILTER_KEYS.WITHDRAWAL_STATUS)}
                        {renderFilter(FILTER_KEYS.WITHDRAWN)}
                        {renderFilter(FILTER_KEYS.TOTAL)}
                        {renderFilter(FILTER_KEYS.AMOUNT_DEBITED)}
                        {renderFilter(FILTER_KEYS.AMOUNT_REIMBURSED)}
                        {renderFilter(FILTER_KEYS.PAID_STATUS)}
                        {renderFilter(FILTER_KEYS.TITLE)}
                        {renderFilter(FILTER_KEYS.IN)}
                        {renderFilter(FILTER_KEYS.IS)}
                        {renderFilter(FILTER_KEYS.ASSIGNEE)}
                    </Suspense>
                </View>
            </View>
        </SafeTriangle>
    );
}

export default SearchAdvancedFiltersPopup;
