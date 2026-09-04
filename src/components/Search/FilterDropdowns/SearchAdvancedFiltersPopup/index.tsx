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

/** Which filter contents are mounted and what each was given. */
type MountedFilterState = {
    /** The filter whose content is shown. */
    activeFilter: SearchFilter['key'];

    /** The mounted contents, in visit order. They stay mounted until the popover closes. */
    mountedFilters: Array<SearchFilter['key']>;

    /** The filter values each mounted instance was built from. A revisit compares against it. */
    formAtMount: Partial<Record<SearchFilter['key'], Partial<SearchAdvancedFiltersForm>>>;

    /** The filter values each content was last shown with. It goes on rendering with them while hidden. */
    formWhileHidden: Partial<Record<SearchFilter['key'], Partial<SearchAdvancedFiltersForm>>>;

    /** How many times each content has been remounted. Part of its key, so a bump replaces the instance. */
    contentVersions: Partial<Record<SearchFilter['key'], number>>;

    /** The deferred filters now allowed to derive. One left out stands as its own loading state. */
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

/** The filters whose contents are derived from the whole contact list, the one derivation heavy enough to be felt. */
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

// React Compiler caches the whole `mountedFilters.map()` in one slot, so every element is rebuilt on each change. Each
// content sits in its own component, so a hover ends the render at the boundary of those whose props did not change.
// `onChange` changes with the form, so an edit still re-renders them all.
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
        formAtMount: {[INITIAL_FILTER]: searchAdvancedFiltersForm},
        formWhileHidden: {},
        contentVersions: {},
        readyFilters: [],
    }));
    const {activeFilter, mountedFilters, formWhileHidden, contentVersions, readyFilters} = mountedFilterState;
    const {updateFilterQueryParams} = useUpdateFilterQuery(queryJSON);

    // Shows a filter's content. A visited one stays mounted, so a return reveals it rather than building it again.
    const showFilter = (filterKey: SearchFilter['key']) => {
        setMountedFilterState((currentState) => {
            if (currentState.activeFilter === filterKey) {
                return currentState;
            }

            const isMounted = currentState.mountedFilters.includes(filterKey);
            // A content decides its selection pinning on mount, so one whose values moved on since it was built is
            // remounted rather than revealed. Only the values that content reads count.
            const isStale = isMounted && hasFilterContentValuesChanged(filterKey, currentState.formAtMount[filterKey], searchAdvancedFiltersForm);
            const isBuilt = !isMounted || isStale;

            return {
                activeFilter: filterKey,
                mountedFilters: isMounted ? currentState.mountedFilters : [...currentState.mountedFilters, filterKey],
                formAtMount: isBuilt ? {...currentState.formAtMount, [filterKey]: searchAdvancedFiltersForm} : currentState.formAtMount,
                // The filter being left keeps the values it had while shown, so hiding it costs no render.
                formWhileHidden: {...currentState.formWhileHidden, [currentState.activeFilter]: searchAdvancedFiltersForm},
                contentVersions: isStale ? {...currentState.contentVersions, [filterKey]: (currentState.contentVersions[filterKey] ?? 0) + 1} : currentState.contentVersions,
                // A remounted content derives itself from scratch, so it waits for the cursor again like a new one.
                readyFilters: isStale ? currentState.readyFilters.filter((key) => key !== filterKey) : currentState.readyFilters,
            };
        });
    };

    /** Lets the shown filter derive what it withheld. It reads the filter from the updater, so a wait outlives its render. */
    const markShownFilterReady = () => {
        setMountedFilterState((currentState) => {
            if (!DEFERRED_CONTENT_FILTERS.has(currentState.activeFilter) || currentState.readyFilters.includes(currentState.activeFilter)) {
                return currentState;
            }

            return {...currentState, readyFilters: [...currentState.readyFilters, currentState.activeFilter]};
        });
    };
    const restTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const cancelReadyWait = () => clearTimeout(restTimeoutRef.current);
    // Drops the wait when the popover closes.
    useEffect(() => cancelReadyWait, []);

    /** Restarted by every movement, so it elapses only once the cursor has come to rest. */
    const waitForCursorToRest = () => {
        cancelReadyWait();
        restTimeoutRef.current = setTimeout(markShownFilterReady, CONST.TIMING.SEARCH_FILTER_HOVER_INTENT_DELAY);
    };

    const hoverFilter = (filterKey: SearchFilter['key']) => {
        showFilter(filterKey);
        waitForCursorToRest();
    };

    // Where the cursor last counted as moving; a hand shaking within the rest radius does not restart the wait.
    const restAnchorRef = useRef<{x: number; y: number} | null>(null);
    const trackPointerMovement = (event: {clientX: number; clientY: number}) => {
        const anchor = restAnchorRef.current;
        if (anchor && Math.hypot(event.clientX - anchor.x, event.clientY - anchor.y) < CONST.SEARCH.HOVER_INTENT_REST_RADIUS_PX) {
            return;
        }

        restAnchorRef.current = {x: event.clientX, y: event.clientY};
        waitForCursorToRest();
    };

    // Nothing is left to wait for once the cursor is gone, so the row it ended on releases what it was withholding,
    // but only for a cursor heading toward the content. The direction comes from the last tracked position rather than
    // from the exit point alone, because `SafeTriangle` covers that path with an overlay of its own and the cursor
    // leaves the list above it as often as through its edge.
    const stopTrackingPointer = (event: {clientX: number}) => {
        cancelReadyWait();
        const anchor = restAnchorRef.current;
        restAnchorRef.current = null;

        if (anchor && event.clientX <= anchor.x) {
            return;
        }

        markShownFilterReady();
    };

    // Moving the focus is deliberate and never passes over rows on the way, so nothing is withheld from it.
    const focusFilter = (filterKey: SearchFilter['key']) => {
        cancelReadyWait();
        showFilter(filterKey);
        markShownFilterReady();
    };

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
                        // `Activity` keeps a hidden content mounted while taking it out of layout and unmounting its
                        // effects, so it holds no Onyx subscriptions until it is shown again.
                        <Activity
                            key={`${filterKey}-${contentVersions[filterKey] ?? 0}`}
                            mode={filterKey === activeFilter ? 'visible' : 'hidden'}
                        >
                            <MountedFilterContent
                                filterKey={filterKey}
                                values={filterKey === activeFilter ? searchAdvancedFiltersForm : formWhileHidden[filterKey]}
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
