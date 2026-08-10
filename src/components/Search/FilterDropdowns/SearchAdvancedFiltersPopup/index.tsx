import SafeTriangle from '@components/SafeTriangle';
import FilterList from '@components/Search/FilterComponents/AdvancedFilters/FilterList';
import SearchAdvancedFiltersContent from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import useUpdateFilterQuery from '@components/Search/hooks/useUpdateFilterQuery';
import type {SearchQueryJSON} from '@components/Search/types';

import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {getFilterNegatableValue} from '@libs/SearchUIUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

import debounce from 'lodash/debounce';
import React, {useEffect, useRef, useState} from 'react';
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

// React Compiler caches the whole `mountedFilters.map()` result in a single slot, so changing the shown filter rebuilds
// every element of it - there is no per-element cache it could bail out on. Comparing props here is what keeps the
// kept-mounted contents, whose own props are unchanged, from re-rendering along with the one being shown.
const MemoizedFilterContent = React.memo(SearchAdvancedFiltersContent);

function SearchAdvancedFiltersPopup({queryJSON}: SearchAdvancedFiltersPopupProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowHeight} = useWindowDimensions();
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    // The list highlights `selectedFilter` immediately; the content pane follows `restedFilter`.
    const [selectedFilter, setSelectedFilter] = useState<SearchFilter['key']>(CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE);
    const [restedFilter, setRestedFilter] = useState<SearchFilter['key']>(CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE);
    // Hovering only shows a row's content once the cursor has stayed on it for SEARCH_FILTER_HOVER_INTENT_DELAY, so
    // sweeping across rows doesn't render a content pane per row. Moving focus is deliberate and never sweeps across
    // rows, so it shows the content right away and keyboard users don't read a pane that is about to be replaced.
    const [debouncedSetRestedFilter] = useState(() => debounce(setRestedFilter, CONST.TIMING.SEARCH_FILTER_HOVER_INTENT_DELAY));
    useEffect(() => () => debouncedSetRestedFilter.cancel(), [debouncedSetRestedFilter]);
    const hoverFilter = (filterKey: SearchFilter['key']) => {
        setSelectedFilter(filterKey);
        debouncedSetRestedFilter(filterKey);
    };
    const focusFilter = (filterKey: SearchFilter['key']) => {
        debouncedSetRestedFilter.cancel();
        setSelectedFilter(filterKey);
        setRestedFilter(filterKey);
    };
    // The MAX_MOUNTED_FILTER_CONTENTS most recently rested filter contents stay mounted (hidden below), so revisits
    // toggle visibility instead of remounting. Kept in least-recently-rested order and adjusted during render so the new
    // pane shows in the same frame.
    const [mountedFilters, setMountedFilters] = useState<Array<SearchFilter['key']>>([CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE]);
    // A kept-mounted content shows the filter values from when it was last rested on (its hidden updates are deferred and
    // its selection pinning is decided on mount), so returning to a filter after the form changed remounts it instead.
    // Both maps are adjusted during render on the rested-filter edge, so the decision applies to the revealing frame.
    const [formAtLastRest, setFormAtLastRest] = useState<Partial<Record<SearchFilter['key'], Partial<SearchAdvancedFiltersForm> | undefined>>>({
        [CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE]: searchAdvancedFiltersForm,
    });
    const [contentVersions, setContentVersions] = useState<Partial<Record<SearchFilter['key'], number>>>({});
    if (mountedFilters.at(-1) !== restedFilter) {
        const nextMountedFilters = [...mountedFilters.filter((filterKey) => filterKey !== restedFilter), restedFilter].slice(-CONST.SEARCH.MAX_MOUNTED_FILTER_CONTENTS);
        const nextFormAtLastRest: Partial<Record<SearchFilter['key'], Partial<SearchAdvancedFiltersForm> | undefined>> = {};
        const nextContentVersions: Partial<Record<SearchFilter['key'], number>> = {};
        // Both maps describe the mounted contents only, so a filter evicted from `mountedFilters` is dropped from them too.
        for (const filterKey of nextMountedFilters) {
            nextFormAtLastRest[filterKey] = filterKey === restedFilter ? searchAdvancedFiltersForm : formAtLastRest[filterKey];
            const version = contentVersions[filterKey];
            if (version !== undefined) {
                nextContentVersions[filterKey] = version;
            }
        }
        if (mountedFilters.includes(restedFilter) && formAtLastRest[restedFilter] !== searchAdvancedFiltersForm) {
            nextContentVersions[restedFilter] = (contentVersions[restedFilter] ?? 0) + 1;
        }
        setFormAtLastRest(nextFormAtLastRest);
        setContentVersions(nextContentVersions);
        setMountedFilters(nextMountedFilters);
    }
    const filterContentRef = useRef<View>(null);

    const {updateFilterQueryParams} = useUpdateFilterQuery(queryJSON);

    return (
        <SafeTriangle submenuRef={filterContentRef}>
            <View style={[styles.flexRow, StyleUtils.getHeight(Math.min(windowHeight, CONST.ADVANCED_FILTERS_POPOVER_HEIGHT))]}>
                <FilterList
                    style={[styles.typeFiltersPopupContainer]}
                    type={searchAdvancedFiltersForm?.type}
                    policyID={getFilterNegatableValue(CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID, searchAdvancedFiltersForm)}
                    selectedFilter={selectedFilter}
                    onHoverIn={hoverFilter}
                    onFocus={focusFilter}
                />
                <View
                    ref={filterContentRef}
                    style={[styles.filterContentContainer]}
                >
                    {mountedFilters.map((filterKey) => (
                        // Backgrounded contents keep their layout (hidden with web-only visibility:hidden) and get the
                        // form values frozen at their last visit, so moving between filters doesn't re-render them and
                        // showing one again is just a style flip. A content whose values went stale is remounted (above).
                        <View
                            key={`${filterKey}-${contentVersions[filterKey] ?? 0}`}
                            style={[styles.flex1, filterKey !== restedFilter && [styles.pAbsolute, styles.w100, styles.h100, styles.visibilityHidden]]}
                        >
                            <MemoizedFilterContent
                                values={filterKey === restedFilter ? searchAdvancedFiltersForm : formAtLastRest[filterKey]}
                                baseFilterKey={filterKey}
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
