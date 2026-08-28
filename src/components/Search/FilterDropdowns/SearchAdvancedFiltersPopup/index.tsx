import SafeTriangle from '@components/SafeTriangle';
import FilterList from '@components/Search/FilterComponents/AdvancedFilters/FilterList';
import SearchAdvancedFiltersContent from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import useUpdateFilterQuery from '@components/Search/hooks/useUpdateFilterQuery';
import type {SearchQueryJSON} from '@components/Search/types';

import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {getFilterNegatableValue, hasFilterContentValuesChanged} from '@libs/SearchUIUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

import React, {Activity, useEffect, useRef, useState} from 'react';
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

    // Shows the content of whichever row the cursor is on once it comes to rest. Time spent on a row cannot tell a
    // deliberate hover from a slow pass over it, but coming to rest can: a cursor traveling down the list keeps
    // restarting the wait however slowly it moves, while one that arrived at its target stops and lets it through.
    const activateRestingFilter = () => {
        activateFilter(hoveredFilter);
    };
    // Held in a ref so a wait started by an earlier render still activates the row the cursor is on now.
    // `useDebounceNonReactive` cannot express either of the waits below: it always hands lodash a `maxWait` key, and
    // lodash reads the key rather than its value, so every wait it creates is capped and fires mid-movement.
    const activateRestingFilterRef = useRef(activateRestingFilter);
    useEffect(() => {
        activateRestingFilterRef.current = activateRestingFilter;
    });

    const restTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const rowAllowanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const cancelPendingActivation = () => {
        clearTimeout(restTimeoutRef.current);
        clearTimeout(rowAllowanceTimeoutRef.current);
    };
    useEffect(() => cancelPendingActivation, []);

    /** Restarted by every movement of the cursor, so it only elapses once the cursor has come to rest. */
    const waitForCursorToRest = () => {
        clearTimeout(restTimeoutRef.current);
        restTimeoutRef.current = setTimeout(() => activateRestingFilterRef.current(), CONST.TIMING.SEARCH_FILTER_HOVER_INTENT_DELAY);
    };

    /**
     * What a cursor that never comes to rest is given instead. Movement does not restart it, so wandering around inside
     * one row still ends in its content being shown, while moving on to the next row does - which is why a pass across
     * the list never reaches it.
     */
    const waitForRowAllowance = () => {
        clearTimeout(rowAllowanceTimeoutRef.current);
        rowAllowanceTimeoutRef.current = setTimeout(() => activateRestingFilterRef.current(), CONST.TIMING.SEARCH_FILTER_HOVER_INTENT_MAX_DELAY);
    };

    const hoverFilter = (filterKey: SearchFilter['key']) => {
        setHoveredFilter(filterKey);
        waitForCursorToRest();
        waitForRowAllowance();
    };

    // Where the cursor was when it last counted as moving. Distance is measured from there rather than from the previous
    // event, because a hand that shakes stays within HOVER_INTENT_REST_RADIUS_PX of one point however many events it
    // emits, while a cursor crossing the list leaves that point behind even when it creeps a pixel at a time.
    const restAnchorRef = useRef<{x: number; y: number} | null>(null);
    const trackPointerMovement = (event: {clientX: number; clientY: number}) => {
        const anchor = restAnchorRef.current;
        if (anchor && Math.hypot(event.clientX - anchor.x, event.clientY - anchor.y) < CONST.SEARCH.HOVER_INTENT_REST_RADIUS_PX) {
            return;
        }

        restAnchorRef.current = {x: event.clientX, y: event.clientY};
        waitForCursorToRest();
    };

    // Leaving the list - for the content pane beside it, or for anywhere else - means the row the cursor last passed
    // over was not the one it was after, so whatever it had pending for that row is dropped rather than replacing the
    // content the user is on their way to.
    const stopTrackingPointer = () => {
        cancelPendingActivation();
        restAnchorRef.current = null;
    };

    // Moving the focus is deliberate and never passes over rows on the way, so it shows the content right away and
    // drops whatever the cursor had pending.
    const focusFilter = (filterKey: SearchFilter['key']) => {
        cancelPendingActivation();
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
                    onPointerMove={trackPointerMovement}
                    onPointerLeave={stopTrackingPointer}
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
