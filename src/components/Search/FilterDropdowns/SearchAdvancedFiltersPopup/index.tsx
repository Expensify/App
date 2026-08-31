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
    /** The filter whose content is shown. */
    activeFilter: SearchFilter['key'];

    /** The filters whose contents are mounted, in the order they were first visited. */
    mountedFilters: Array<SearchFilter['key']>;

    /** Per mounted content, the filter values it was given when it last became active. */
    formAtLastVisit: Partial<Record<SearchFilter['key'], Partial<SearchAdvancedFiltersForm> | undefined>>;

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
// every element of it. Each content sits in its own component, so one whose props are unchanged returns the element it
// returned before and the render ends there.
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
        formAtLastVisit: {[INITIAL_FILTER]: searchAdvancedFiltersForm},
        contentVersions: {},
    }));
    const {activeFilter, mountedFilters, formAtLastVisit, contentVersions} = mountedFilterState;
    const {updateFilterQueryParams} = useUpdateFilterQuery(queryJSON);

    // A content stays mounted once visited, so revisiting a filter reveals it instead of building it again. Contents
    // are built only for the filters actually visited and live only while the popover is open.
    const activateFilter = (filterKey: SearchFilter['key']) => {
        setMountedFilterState((currentState) => {
            if (currentState.activeFilter === filterKey) {
                return currentState;
            }

            const isMounted = currentState.mountedFilters.includes(filterKey);
            // A kept content keeps the values it was last given and decides its selection pinning on mount, so one whose
            // values went stale while it was hidden is remounted instead of revealed. Only the values that content reads
            // count as stale - a change to a filter it doesn't read leaves its own state, like a typed search term, alone.
            const isStale = isMounted && hasFilterContentValuesChanged(filterKey, currentState.formAtLastVisit[filterKey], searchAdvancedFiltersForm);

            return {
                activeFilter: filterKey,
                mountedFilters: isMounted ? currentState.mountedFilters : [...currentState.mountedFilters, filterKey],
                formAtLastVisit: {...currentState.formAtLastVisit, [filterKey]: searchAdvancedFiltersForm},
                contentVersions: isStale ? {...currentState.contentVersions, [filterKey]: (currentState.contentVersions[filterKey] ?? 0) + 1} : currentState.contentVersions,
            };
        });
    };

    // Shows the content of whichever row the cursor is on once it comes to rest. Time spent on a row cannot tell a
    // deliberate hover from a slow pass over it, but coming to rest can.
    const activateRestingFilter = () => {
        activateFilter(hoveredFilter);
    };
    // Held in a ref so a wait started by an earlier render still activates the row the cursor is on now.
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

    /** What a cursor that never comes to rest is given instead. Only moving on to the next row restarts it. */
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
    // event, so a shaking hand stays within HOVER_INTENT_REST_RADIUS_PX of one point while a slow crossing does not.
    const restAnchorRef = useRef<{x: number; y: number} | null>(null);
    const trackPointerMovement = (event: {clientX: number; clientY: number}) => {
        const anchor = restAnchorRef.current;
        if (anchor && Math.hypot(event.clientX - anchor.x, event.clientY - anchor.y) < CONST.SEARCH.HOVER_INTENT_REST_RADIUS_PX) {
            return;
        }

        restAnchorRef.current = {x: event.clientX, y: event.clientY};
        waitForCursorToRest();
    };

    // Nothing is left to wait for once the cursor is gone, so the row it ended on is shown and the highlight and the
    // content agree again.
    const stopTrackingPointer = () => {
        cancelPendingActivation();
        restAnchorRef.current = null;
        activateFilter(hoveredFilter);
    };

    // Moving the focus is deliberate and never passes over rows on the way, so it shows the content right away.
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
                        // unmounts its effects while it is hidden, so it holds no Onyx subscriptions until it is shown again.
                        <Activity
                            key={`${filterKey}-${contentVersions[filterKey] ?? 0}`}
                            mode={filterKey === activeFilter ? 'visible' : 'hidden'}
                        >
                            <MountedFilterContent
                                filterKey={filterKey}
                                values={filterKey === activeFilter ? searchAdvancedFiltersForm : formAtLastVisit[filterKey]}
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
