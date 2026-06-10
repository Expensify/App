import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import SafeTriangle from '@components/SafeTriangle';
import FilterContent from '@components/Search/FilterComponents/AdvancedFilters/FilterContent';
import FilterList from '@components/Search/FilterComponents/AdvancedFilters/FilterList';
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

type AdvancedFiltersPopupProps = {
    queryJSON: SearchQueryJSON;
};

function AdvancedFiltersPopup({queryJSON}: AdvancedFiltersPopupProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowHeight} = useWindowDimensions();
    const [selectedFilter, setSelectedFilter] = useState<SearchFilter['key']>(CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE);
    const filterContentRef = useRef<View>(null);
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

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
                    <FilterContent
                        values={searchAdvancedFiltersForm}
                        filterKey={selectedFilter}
                        policyIDQuery={queryJSON.policyID}
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

export default AdvancedFiltersPopup;
