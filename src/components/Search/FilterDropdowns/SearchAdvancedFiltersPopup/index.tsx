import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import SafeTriangle from '@components/SafeTriangle';
import FilterList from '@components/Search/FilterComponents/AdvancedFilters/FilterList';
import SearchAdvancedFiltersContent from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import useUpdateFilterQuery from '@components/Search/hooks/useUpdateFilterQuery';
import type {SearchQueryJSON} from '@components/Search/types';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {setSearchContext} from '@libs/actions/Search';
import type {SearchFilter} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import AmountFilterContentPopupWrapper from './AmountFilterContentPopupWrapper';
import CommonFilterContentPopupWrapper from './CommonFilterContentPopupWrapper';
import DateFilterContentPopupWrapper from './DateFilterContentPopupWrapper';
import ReportFieldFilterContentPopupWrapper from './ReportFieldFilterContentPopupWrapper';
import TextInputFilterContentPopupWrapper from './TextInputFilterContentPopupWrapper';

type SearchAdvancedFiltersPopupProps = {
    queryJSON: SearchQueryJSON;
};

function SearchAdvancedFiltersPopup({queryJSON}: SearchAdvancedFiltersPopupProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowHeight} = useWindowDimensions();
    const [selectedFilter, setSelectedFilter] = useState<SearchFilter['key']>(CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE);
    const filterContentRef = useRef<View>(null);
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const [storedYearSelection] = useOnyx(ONYXKEYS.CALENDAR_PICKER_SELECTED_YEAR);
    const hasRestoredFilterRef = useRef(false);

    // The year picker is only reached from the Date filter; opening it blurs the Search screen and unmounts
    // this popover, which would otherwise remount reset to the default Type filter. When returning (a pending
    // year write-back for a search calendar), reopen to the Date filter so the user lands back on the calendar.
    useEffect(() => {
        if (hasRestoredFilterRef.current || !storedYearSelection?.contextID.startsWith('search')) {
            return;
        }
        hasRestoredFilterRef.current = true;
        requestAnimationFrame(() => setSelectedFilter(CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE));
    }, [storedYearSelection]);

    const {updateFilterQueryParams} = useUpdateFilterQuery(queryJSON);

    return (
        <SafeTriangle submenuRef={filterContentRef}>
            <View style={[styles.flexRow, StyleUtils.getHeight(Math.min(windowHeight, CONST.ADVANCED_FILTERS_POPOVER_HEIGHT))]}>
                <FilterList
                    style={[styles.typeFiltersPopupContainer]}
                    type={searchAdvancedFiltersForm?.type}
                    policyID={searchAdvancedFiltersForm?.policyID}
                    selectedFilter={selectedFilter}
                    onHoverIn={setSelectedFilter}
                    onFocus={setSelectedFilter}
                />
                <View
                    ref={filterContentRef}
                    style={[styles.filterContentContainer]}
                >
                    <SearchAdvancedFiltersContent
                        values={searchAdvancedFiltersForm}
                        filterKey={selectedFilter}
                        policyIDQuery={queryJSON.policyID}
                        components={{
                            Common: CommonFilterContentPopupWrapper,
                            Text: TextInputFilterContentPopupWrapper,
                            Amount: AmountFilterContentPopupWrapper,
                            Date: DateFilterContentPopupWrapper,
                            ReportField: ReportFieldFilterContentPopupWrapper,
                        }}
                        onChange={(values) => {
                            updateFilterQueryParams(values);
                            if (values.keyword) {
                                setSearchContext(true);
                            }
                        }}
                    />
                </View>
            </View>
        </SafeTriangle>
    );
}

export default SearchAdvancedFiltersPopup;
