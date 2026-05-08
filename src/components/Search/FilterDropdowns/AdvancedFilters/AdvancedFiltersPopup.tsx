import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import SafeTriangle from '@components/SafeTriangle';
import useUpdateFilterQuery from '@components/Search/hooks/useUpdateFilterQuery';
import type {SearchQueryJSON} from '@components/Search/types';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SearchFilter} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import FilterList from './FilterList';
import SelectedFilterContent from './SelectedFilterContent';

type AdvancedFiltersPopupProps = {
    queryJSON: SearchQueryJSON;
};

function AdvancedFiltersPopup({queryJSON}: AdvancedFiltersPopupProps) {
    const styles = useThemeStyles();
    const [selectedFilter, setSelectedFilter] = useState<SearchFilter['key']>(CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE);
    const filterContentRef = useRef<View>(null);
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    const updateFilterQueryParams = useUpdateFilterQuery(queryJSON, false);

    return (
        <SafeTriangle submenuRef={filterContentRef}>
            <View style={[styles.advanceFiltersPopupContainer]}>
                <FilterList
                    selectedFilter={selectedFilter}
                    onFilterSelected={setSelectedFilter}
                />
                <View
                    ref={filterContentRef}
                    style={[styles.filterContentContainer]}
                >
                    <SelectedFilterContent
                        values={searchAdvancedFiltersForm}
                        filterKey={selectedFilter}
                        policyIDQuery={queryJSON.policyID}
                        onChange={updateFilterQueryParams}
                    />
                </View>
            </View>
        </SafeTriangle>
    );
}

export default AdvancedFiltersPopup;
