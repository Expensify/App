import SafeTriangle from '@components/SafeTriangle';
import FilterList from '@components/Search/FilterComponents/AdvancedFilters/FilterList';
import SearchAdvancedFiltersContent from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import useUpdateFilterQuery from '@components/Search/hooks/useUpdateFilterQuery';
import type {SearchQueryJSON} from '@components/Search/types';

import useDebounceNonReactive from '@hooks/useDebounceNonReactive';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {getFilterNegatableValue, hasFilterContentValuesChanged} from '@libs/SearchUIUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

import React, {Activity, useRef, useState} from 'react';
import {View} from 'react-native';

import AmountFilterContentPopupWrapper from './AmountFilterContentPopupWrapper';
import DateFilterContentPopupWrapper from './DateFilterContentPopupWrapper';
import ListFilterContentPopupWrapper from './ListFilterContentPopupWrapper';
import ReportFieldFilterContentPopupWrapper from './ReportFieldFilterContentPopupWrapper';
import TextInputFilterContentPopupWrapper from './TextInputFilterContentPopupWrapper';

type SearchAdvancedFiltersPopupProps = {
    queryJSON: SearchQueryJSON;
};

/** Which filter contents are mounted and what each of them was given, held together so one filter change moves all of it. */
type MountedFilterState = {
    /** The filter whose content is shown. Also the most recently used entry of `mountedFilters`. */
    activeFilter: SearchFilter['key'];

    /** The filters whose contents are mounted, in least-recently-used order. */
    mountedFilters: Array<SearchFilter['key']>;

    /** Per mounted content, the filter values it was given when it last became active. */
    formAtLastRest: Partial<Record<SearchFilter['key'], Partial<SearchAdvancedFiltersForm> | undefined>>;

    /** Per mounted content, how many times it has been remounted. Part of its key, so a bump replaces the instance. */
    contentVersions: Partial<Record<SearchFilter['key'], number>>;
};

const filterComponents = {
    List: ListFilterContentPopupWrapper,
    Text: TextInputFilterContentPopupWrapper,
    Amount: AmountFilterContentPopupWrapper,
    Date: DateFilterContentPopupWrapper,
    ReportField: ReportFieldFilterContentPopupWrapper,
} as const;

/** The filter the popover opens on. */
const INITIAL_FILTER = CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE;

type MountedFilterContentProps = {
    /** The filter whose content this is. */
    filterKey: SearchFilter['key'];

    /** The filter values the content reads. */
    values: Partial<SearchAdvancedFiltersForm> | undefined;

    /** Called with the values a change in the content produces. */
    onChange: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

// React Compiler caches the whole `mountedFilters.map()` result in a single slot, so changing the shown filter rebuilds
// every element of it. Each content sits in its own component, so the rebuilt element lands on this component's cache
// and one whose props are unchanged returns the element it returned before, which ends the render there.
function MountedFilterContent({filterKey, values, onChange}: MountedFilterContentProps) {
    const styles = useThemeStyles();

    return (
        <View style={styles.flex1}>
            <SearchAdvancedFiltersContent
                values={values}
                baseFilterKey={filterKey}
                components={filterComponents}
                onChange={onChange}
            />
        </View>
    );
}

function SearchAdvancedFiltersPopup({queryJSON}: SearchAdvancedFiltersPopupProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowHeight} = useWindowDimensions();
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const filterContentRef = useRef<View>(null);
    // The list highlights `hoveredFilter` immediately. The content pane follows `activeFilter`.
    const [hoveredFilter, setHoveredFilter] = useState<SearchFilter['key']>(INITIAL_FILTER);
    const [mountedFilterState, setMountedFilterState] = useState<MountedFilterState>(() => ({
        activeFilter: INITIAL_FILTER,
        mountedFilters: [INITIAL_FILTER],
        formAtLastRest: {[INITIAL_FILTER]: searchAdvancedFiltersForm},
        contentVersions: {},
    }));
    const {activeFilter, mountedFilters, formAtLastRest, contentVersions} = mountedFilterState;
    const {updateFilterQueryParams} = useUpdateFilterQuery(queryJSON);

    // The MAX_MOUNTED_FILTER_CONTENTS most recently active contents stay mounted, so revisiting a filter reveals its
    // content instead of building it again. Activating a filter promotes it to most recently used and evicts whatever
    // falls past the cap.
    const activateFilter = (filterKey: SearchFilter['key']) => {
        setMountedFilterState((currentState) => {
            if (currentState.activeFilter === filterKey) {
                return currentState;
            }

            const nextMountedFilters = [...currentState.mountedFilters.filter((mountedFilter) => mountedFilter !== filterKey), filterKey].slice(-CONST.SEARCH.MAX_MOUNTED_FILTER_CONTENTS);
            const nextFormAtLastRest: MountedFilterState['formAtLastRest'] = {};
            const nextContentVersions: MountedFilterState['contentVersions'] = {};
            // Both maps describe the mounted contents only, so a filter evicted from `mountedFilters` is dropped from them too.
            for (const mountedFilter of nextMountedFilters) {
                nextFormAtLastRest[mountedFilter] = mountedFilter === filterKey ? searchAdvancedFiltersForm : currentState.formAtLastRest[mountedFilter];
                const version = currentState.contentVersions[mountedFilter];
                if (version !== undefined) {
                    nextContentVersions[mountedFilter] = version;
                }
            }
            // A kept content keeps the values it was last given and decides its selection pinning on mount, so one whose
            // values went stale while it was hidden is remounted instead of revealed. Only the values that content reads
            // count as stale - a change to a filter it doesn't read leaves its own state, like a typed search term, alone.
            if (currentState.mountedFilters.includes(filterKey) && hasFilterContentValuesChanged(filterKey, currentState.formAtLastRest[filterKey], searchAdvancedFiltersForm)) {
                nextContentVersions[filterKey] = (currentState.contentVersions[filterKey] ?? 0) + 1;
            }

            return {
                activeFilter: filterKey,
                mountedFilters: nextMountedFilters,
                formAtLastRest: nextFormAtLastRest,
                contentVersions: nextContentVersions,
            };
        });
    };

    // The debounce below always calls the latest version of this, so a hover whose delay elapsed after the cursor or the
    // focus already moved on is dropped instead of replacing the content of the row the user is on now.
    const activateHoveredFilter = (filterKey: SearchFilter['key']) => {
        if (filterKey !== hoveredFilter) {
            return;
        }

        activateFilter(filterKey);
    };

    // Hovering only shows a row's content once the cursor has stayed on it for SEARCH_FILTER_HOVER_INTENT_DELAY, so
    // sweeping across rows doesn't render a content pane per row. Moving focus is deliberate and never sweeps across
    // rows, so it shows the content right away and keyboard users don't read a pane that is about to be replaced.
    const debouncedActivateHoveredFilter = useDebounceNonReactive(activateHoveredFilter, CONST.TIMING.SEARCH_FILTER_HOVER_INTENT_DELAY);

    const hoverFilter = (filterKey: SearchFilter['key']) => {
        setHoveredFilter(filterKey);
        debouncedActivateHoveredFilter(filterKey);
    };

    const focusFilter = (filterKey: SearchFilter['key']) => {
        setHoveredFilter(filterKey);
        activateFilter(filterKey);
    };

    return (
        <SafeTriangle submenuRef={filterContentRef}>
            <View style={[styles.flexRow, StyleUtils.getHeight(Math.min(windowHeight, CONST.ADVANCED_FILTERS_POPOVER_HEIGHT))]}>
                <FilterList
                    style={[styles.typeFiltersPopupContainer]}
                    type={searchAdvancedFiltersForm?.type}
                    policyID={getFilterNegatableValue(CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID, searchAdvancedFiltersForm)}
                    selectedFilter={hoveredFilter}
                    onHoverIn={hoverFilter}
                    onFocus={focusFilter}
                />
                <View
                    ref={filterContentRef}
                    style={[styles.filterContentContainer]}
                >
                    {mountedFilters.map((filterKey) => (
                        // A backgrounded content stays mounted with the filter values frozen at its last visit, so moving
                        // between filters neither re-renders it nor loses its state. `Activity` takes it out of layout and
                        // unmounts its effects while it is hidden - so it holds no Onyx subscriptions of its own until it is
                        // shown again - and lets React render it at a lower priority than the visible one when a context
                        // both of them read changes underneath.
                        <Activity
                            key={`${filterKey}-${contentVersions[filterKey] ?? 0}`}
                            mode={filterKey === activeFilter ? 'visible' : 'hidden'}
                        >
                            <MountedFilterContent
                                filterKey={filterKey}
                                values={filterKey === activeFilter ? searchAdvancedFiltersForm : formAtLastRest[filterKey]}
                                onChange={updateFilterQueryParams}
                            />
                        </Activity>
                    ))}
                </View>
            </View>
        </SafeTriangle>
    );
}

export default SearchAdvancedFiltersPopup;
