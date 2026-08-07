import SafeTriangle from '@components/SafeTriangle';
import FilterList from '@components/Search/FilterComponents/AdvancedFilters/FilterList';
import SearchAdvancedFiltersContent from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import PersonalDetailOptionsKeepWarm from '@components/Search/FilterComponents/PersonalDetailOptionsKeepWarm';
import useUpdateFilterQuery from '@components/Search/hooks/useUpdateFilterQuery';
import type {SearchQueryJSON} from '@components/Search/types';

import useDebouncedState from '@hooks/useDebouncedState';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {getFilterNegatableValue} from '@libs/SearchUIUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useRef, useState} from 'react';
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
    // The list highlights `selectedFilter` immediately; the content pane follows `restedFilter` once the cursor has stayed
    // on a row for SEARCH_FILTER_HOVER_INTENT_DELAY, so sweeping across rows doesn't render a content pane per row.
    const [selectedFilter, restedFilter, setSelectedFilter] = useDebouncedState<SearchFilter['key']>(CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE, CONST.TIMING.SEARCH_FILTER_HOVER_INTENT_DELAY);
    // The MAX_MOUNTED_FILTER_CONTENTS most recently rested filter contents stay mounted, so revisits toggle visibility
    // instead of remounting. Kept in least-recently-rested order and adjusted during render so the new pane shows in the same frame.
    const [mountedFilters, setMountedFilters] = useState<Array<SearchFilter['key']>>([CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE]);
    if (mountedFilters.at(-1) !== restedFilter) {
        setMountedFilters([...mountedFilters.filter((filterKey) => filterKey !== restedFilter), restedFilter].slice(-CONST.SEARCH.MAX_MOUNTED_FILTER_CONTENTS));
    }
    const filterContentRef = useRef<View>(null);
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    const {updateFilterQueryParams} = useUpdateFilterQuery(queryJSON);

    return (
        <SafeTriangle submenuRef={filterContentRef}>
            <PersonalDetailOptionsKeepWarm />
            <View style={[styles.flexRow, StyleUtils.getHeight(Math.min(windowHeight, CONST.ADVANCED_FILTERS_POPOVER_HEIGHT))]}>
                <FilterList
                    style={[styles.typeFiltersPopupContainer]}
                    type={searchAdvancedFiltersForm?.type}
                    policyID={getFilterNegatableValue(CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID, searchAdvancedFiltersForm)}
                    selectedFilter={selectedFilter}
                    onHoverIn={setSelectedFilter}
                    onFocus={setSelectedFilter}
                />
                <View
                    ref={filterContentRef}
                    style={[styles.filterContentContainer]}
                >
                    {mountedFilters.map((filterKey) => (
                        // Backgrounded contents keep their layout (hidden with web-only visibility:hidden), so their lists
                        // keep laying out updates made in the background and showing one again is just a style flip.
                        <View
                            key={filterKey}
                            style={[styles.flex1, filterKey !== restedFilter && [styles.pAbsolute, styles.w100, styles.h100, styles.visibilityHidden]]}
                        >
                            {/* `isActive` follows the non-debounced `selectedFilter`, so a content refreshes itself while
                                still laid out, before the hover intent delay swaps it out. */}
                            <SearchAdvancedFiltersContent
                                values={searchAdvancedFiltersForm}
                                baseFilterKey={filterKey}
                                isActive={filterKey === selectedFilter}
                                components={filterComponents}
                                onChange={updateFilterQueryParams}
                            />
                        </View>
                    ))}
                </View>
            </View>
        </SafeTriangle>
    );
}

export default SearchAdvancedFiltersPopup;
