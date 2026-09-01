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

/** Which filter contents are mounted and what each was given. Kept in one object so a single update moves them together. */
type MountedFilterState = {
    /** The filter whose content is shown. */
    activeFilter: SearchFilter['key'];

    /** The filters whose contents are mounted, in the order they were first visited. They stay mounted until the popover closes. */
    mountedFilters: Array<SearchFilter['key']>;

    /** Per mounted content, the filter values it was given when it last became the shown one. What a hidden content goes on rendering, and what a revisit is compared against. */
    formAtLastVisit: Partial<Record<SearchFilter['key'], Partial<SearchAdvancedFiltersForm> | undefined>>;

    /** Per mounted content, how many times it has been remounted. Part of its key, so a bump replaces the instance. */
    contentVersions: Partial<Record<SearchFilter['key'], number>>;

    /** The deferred filters now allowed to derive their contents. A deferred filter left out of this stands as its own loading state. */
    readyFilters: Array<SearchFilter['key']>;
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

/**
 * The filters whose contents are derived from the whole contact list, which is the one derivation heavy enough to be
 * felt. They are the four routed to `UserSelector`, the only component under Search that reads personal detail options.
 * Every other filter renders as fast as the row is pointed at.
 */
const DEFERRED_CONTENT_FILTERS = new Set<SearchFilter['key']>([
    CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.TO,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.ATTENDEE,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.ASSIGNEE,
]);

type MountedFilterContentProps = {
    /** The filter whose content this is. */
    filterKey: SearchFilter['key'];

    /** The filter values the content reads. */
    values: Partial<SearchAdvancedFiltersForm> | undefined;

    /** Whether the content may derive itself, or has to stand as its own loading state for now. */
    ready: boolean;

    /** Called with the values a change in the content produces. */
    onChange: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

// React Compiler caches the whole `mountedFilters.map()` result in a single slot, so changing the shown filter rebuilds
// every element of it. Each content sits in its own component, so moving between filters ends the render at the boundary
// of the ones whose props did not change. A change to the form does change `onChange`, and then every mounted content
// re-renders.
function MountedFilterContent({filterKey, values, ready, onChange}: MountedFilterContentProps) {
    const styles = useThemeStyles();

    return (
        <View style={styles.flex1}>
            <SearchAdvancedFiltersContent
                values={values}
                baseFilterKey={filterKey}
                components={filterComponents}
                ready={ready}
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
    const [mountedFilterState, setMountedFilterState] = useState<MountedFilterState>(() => ({
        activeFilter: INITIAL_FILTER,
        mountedFilters: [INITIAL_FILTER],
        formAtLastVisit: {[INITIAL_FILTER]: searchAdvancedFiltersForm},
        contentVersions: {},
        readyFilters: [],
    }));
    const {activeFilter, mountedFilters, formAtLastVisit, contentVersions, readyFilters} = mountedFilterState;
    const {updateFilterQueryParams} = useUpdateFilterQuery(queryJSON);

    // The pane follows the cursor with no wait of its own, so pointing at a row shows that filter at any speed. A content
    // stays mounted once visited, so coming back to one reveals it instead of building it again.
    const showFilter = (filterKey: SearchFilter['key']) => {
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
                // A remounted content derives itself from scratch, so it waits for the cursor again like a new one.
                readyFilters: isStale ? currentState.readyFilters.filter((key) => key !== filterKey) : currentState.readyFilters,
            };
        });
    };

    /**
     * Lets the shown filter derive what it withheld. Which filter that is comes from the updater rather than from the
     * render that scheduled the wait, so a wait outlives the render it started in. Only a deferred filter withholds
     * anything, so marking any other one would be an update that changes nothing on screen.
     */
    const markShownFilterReady = () => {
        setMountedFilterState((currentState) => {
            if (!DEFERRED_CONTENT_FILTERS.has(currentState.activeFilter) || currentState.readyFilters.includes(currentState.activeFilter)) {
                return currentState;
            }

            return {...currentState, readyFilters: [...currentState.readyFilters, currentState.activeFilter]};
        });
    };
    const restTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const rowAllowanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const cancelReadyWaits = () => {
        clearTimeout(restTimeoutRef.current);
        clearTimeout(rowAllowanceTimeoutRef.current);
    };
    // Drops both waits when the popover closes.
    useEffect(() => cancelReadyWaits, []);

    /**
     * Restarted by every movement of the cursor, so it only elapses once the cursor has come to rest. Time spent on a
     * row cannot tell a deliberate hover from a slow pass over it, but coming to rest can.
     */
    const waitForCursorToRest = () => {
        clearTimeout(restTimeoutRef.current);
        restTimeoutRef.current = setTimeout(markShownFilterReady, CONST.TIMING.SEARCH_FILTER_HOVER_INTENT_DELAY);
    };

    /** What a cursor that wanders inside one row without ever resting is given instead. Only entering a row restarts it. */
    const waitForRowAllowance = () => {
        clearTimeout(rowAllowanceTimeoutRef.current);
        rowAllowanceTimeoutRef.current = setTimeout(markShownFilterReady, CONST.TIMING.SEARCH_FILTER_HOVER_INTENT_MAX_DELAY);
    };

    const hoverFilter = (filterKey: SearchFilter['key']) => {
        showFilter(filterKey);
        waitForCursorToRest();
        waitForRowAllowance();
    };

    // Where the cursor was when it last counted as moving. Distance is measured from there rather than from the previous
    // event, so a shaking hand stays within HOVER_INTENT_REST_RADIUS_PX of one point while a slow crossing does not. The
    // anchor marks where the cursor last moved, not which row it is over, so entering a row does not reset it.
    const restAnchorRef = useRef<{x: number; y: number} | null>(null);
    const trackPointerMovement = (event: {clientX: number; clientY: number}) => {
        const anchor = restAnchorRef.current;
        if (anchor && Math.hypot(event.clientX - anchor.x, event.clientY - anchor.y) < CONST.SEARCH.HOVER_INTENT_REST_RADIUS_PX) {
            return;
        }

        restAnchorRef.current = {x: event.clientX, y: event.clientY};
        waitForCursorToRest();
    };

    // Nothing is left to wait for once the cursor is gone, so whatever the row it ended on was withholding is released.
    const stopTrackingPointer = () => {
        cancelReadyWaits();
        restAnchorRef.current = null;
        markShownFilterReady();
    };

    // Moving the focus is deliberate and never passes over rows on the way, so nothing is withheld from it.
    const focusFilter = (filterKey: SearchFilter['key']) => {
        cancelReadyWaits();
        showFilter(filterKey);
        markShownFilterReady();
    };

    // Only the contact-list filters withhold anything; every other content is ready as soon as it is mounted.
    const mayDeriveContent = (filterKey: SearchFilter['key']) => !DEFERRED_CONTENT_FILTERS.has(filterKey) || readyFilters.includes(filterKey);

    return (
        <SafeTriangle submenuRef={filterContentRef}>
            <View style={[styles.flexRow, StyleUtils.getHeight(Math.min(windowHeight, CONST.ADVANCED_FILTERS_POPOVER_HEIGHT))]}>
                <FilterList
                    style={[styles.typeFiltersPopupContainer]}
                    type={searchAdvancedFiltersForm?.type}
                    policyID={getFilterNegatableValue(CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID, searchAdvancedFiltersForm)}
                    selectedFilter={activeFilter}
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
                                ready={mayDeriveContent(filterKey)}
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
