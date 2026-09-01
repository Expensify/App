import {act, render, screen} from '@testing-library/react-native';

import type {SearchQueryJSON} from '@components/Search/types';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

import React, {useRef} from 'react';
import {View} from 'react-native';

// jest.mock factories can't reference imported bindings, but `mock`-prefixed locals are allowed.
const MockView = View;
const mockUseRef = useRef;

const FILTER_KEYS = CONST.SEARCH.SYNTAX_FILTER_KEYS;

/** Called once per mounted filter content instance, so a remount shows up as a second call for the same key. */
const mockOnContentCreated = jest.fn<void, [string]>();

/** What each mounted content was last told about deriving itself. */
let mockReadyByFilter: Record<string, boolean> = {};

/** The filter values each mounted content was last rendered with. */
let mockValuesByFilter: Record<string, Partial<SearchAdvancedFiltersForm> | undefined> = {};

// Handed to the filter list by the popup and captured here, so tests can drive the cursor and read what is highlighted.
let mockOnHoverIn: ((filterKey: string) => void) | undefined;
let mockOnFocus: ((filterKey: string) => void) | undefined;
let mockOnPointerMove: ((event: {clientX: number; clientY: number}) => void) | undefined;
let mockOnPointerLeave: (() => void) | undefined;
let mockSelectedFilter: string | undefined;

/** The advanced filters form served by the useOnyx mock. Reassigned by tests simulating filter value changes. */
let mockFiltersForm: Partial<SearchAdvancedFiltersForm> | undefined;

jest.mock('@components/SafeTriangle', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => <MockView>{children}</MockView>,
}));

// Stand-in for the filter list: it renders no rows and only hands the tests what the popup gave it.
jest.mock('@components/Search/FilterComponents/AdvancedFilters/FilterList', () => ({
    __esModule: true,
    default: (props: {
        onHoverIn: (filterKey: string) => void;
        onFocus: (filterKey: string) => void;
        onPointerMove: (event: {clientX: number; clientY: number}) => void;
        onPointerLeave: () => void;
        selectedFilter: string;
    }) => {
        mockOnHoverIn = props.onHoverIn;
        mockOnFocus = props.onFocus;
        mockOnPointerMove = props.onPointerMove;
        mockOnPointerLeave = props.onPointerLeave;
        mockSelectedFilter = props.selectedFilter;

        return null;
    },
}));

// Stand-in for the filter content, which is the expensive part being mounted or kept alive.
jest.mock('@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent', () => ({
    __esModule: true,
    default: ({baseFilterKey, ready, values}: {baseFilterKey: string; ready?: boolean; values?: Partial<SearchAdvancedFiltersForm>}) => {
        const isCreated = mockUseRef(false);
        if (!isCreated.current) {
            isCreated.current = true;
            mockOnContentCreated(baseFilterKey);
        }
        mockReadyByFilter[baseFilterKey] = !!ready;
        mockValuesByFilter[baseFilterKey] = values;

        return <MockView testID={`filter-content-${baseFilterKey}`} />;
    },
}));

// One callback for the life of the test: a fresh one per render would defeat the boundary that keeps mounted contents
// from re-rendering, and hide a regression that removed it.
const mockUpdateFilterQueryParams = jest.fn();
jest.mock('@components/Search/hooks/useUpdateFilterQuery', () => ({
    __esModule: true,
    default: () => ({updateFilterQueryParams: mockUpdateFilterQueryParams}),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [mockFiltersForm, {status: 'loaded'}],
}));

// The popover exists on web only (index.native.tsx renders nothing), and jest-expo's RN resolver prefers the native variant.
const SearchAdvancedFiltersPopup = require<{
    default: React.ComponentType<{queryJSON: SearchQueryJSON | undefined}>;
}>('../../../src/components/Search/FilterDropdowns/SearchAdvancedFiltersPopup/index.tsx').default;

// Only forwarded to the mocked query hook, so the parsed query itself does not matter here.
/** Renders the popup again, which is what carries a reassigned form into it while the shown filter stays put. */
let rerenderPopup: () => void;

const queryJSON = buildSearchQueryJSON(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE}`);

/** Moves the cursor onto a filter row without waiting for the hover intent delay. */
function hover(filterKey: string) {
    act(() => {
        mockOnHoverIn?.(filterKey);
    });
}

/** Moves the cursor onto a filter row and leaves it there long enough for what it withheld to be released. */
function hoverAndRest(filterKey: string) {
    hover(filterKey);
    act(() => {
        jest.advanceTimersByTime(CONST.TIMING.SEARCH_FILTER_HOVER_INTENT_DELAY);
    });
}

/** Travels the cursor to a point over the filter list. */
function movePointer(clientX: number, clientY: number) {
    act(() => {
        mockOnPointerMove?.({clientX, clientY});
    });
}

/** Takes the cursor off the filter list, towards the content pane beside it. */
function leaveList() {
    act(() => {
        mockOnPointerLeave?.();
    });
}

/** Moves the keyboard focus onto a filter row. */
function focus(filterKey: string) {
    act(() => {
        mockOnFocus?.(filterKey);
    });
}

beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockFiltersForm = undefined;
    mockReadyByFilter = {};
    mockValuesByFilter = {};
    const view = render(<SearchAdvancedFiltersPopup queryJSON={queryJSON} />);
    rerenderPopup = () => view.rerender(<SearchAdvancedFiltersPopup queryJSON={queryJSON} />);
});

afterEach(() => {
    jest.useRealTimers();
});

describe('SearchAdvancedFiltersPopup', () => {
    it('shows every row the cursor passes over and withholds the contact list from all but the one it stops on', () => {
        const peopleFilters = [FILTER_KEYS.FROM, FILTER_KEYS.TO, FILTER_KEYS.ATTENDEE, FILTER_KEYS.ASSIGNEE];
        for (const [row, filterKey] of peopleFilters.entries()) {
            hover(filterKey);
            movePointer(100, 100 + row * 30);
            act(() => {
                jest.advanceTimersByTime(12);
            });
        }

        // The pane kept up with the cursor, and not one of the rows it crossed built a contact list.
        expect(mockSelectedFilter).toBe(FILTER_KEYS.ASSIGNEE);
        for (const filterKey of peopleFilters) {
            expect(mockOnContentCreated).toHaveBeenCalledWith(filterKey);
            expect(mockReadyByFilter[filterKey]).toBe(false);
        }

        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.SEARCH_FILTER_HOVER_INTENT_DELAY);
        });

        expect(mockReadyByFilter[FILTER_KEYS.ASSIGNEE]).toBe(true);
        expect(mockReadyByFilter[FILTER_KEYS.FROM]).toBe(false);
    });

    it('marks a filter outside the contact-list group ready the moment it is pointed at', () => {
        hover(FILTER_KEYS.STATUS);

        // No timer is advanced: nothing about this filter is worth waiting for.
        expect(mockOnContentCreated).toHaveBeenCalledWith(FILTER_KEYS.STATUS);
        expect(mockReadyByFilter[FILTER_KEYS.STATUS]).toBe(true);
    });

    it('treats a cursor that only shakes on the spot as at rest', () => {
        hover(FILTER_KEYS.FROM);
        movePointer(100, 100);
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.SEARCH_FILTER_HOVER_INTENT_DELAY - 10);
        });
        // Within HOVER_INTENT_REST_RADIUS_PX of where it settled, so it does not restart the wait.
        movePointer(104, 103);
        act(() => {
            jest.advanceTimersByTime(15);
        });

        expect(mockReadyByFilter[FILTER_KEYS.FROM]).toBe(true);
    });

    it('releases a row the cursor never rests on once its per-row allowance elapses', () => {
        const step = CONST.TIMING.SEARCH_FILTER_HOVER_INTENT_DELAY - 10;
        let elapsed = 0;
        let corner = 0;
        // Wandering inside the row, always further than the rest radius, so every step restarts the rest wait and only
        // the row allowance can end it.
        const wander = () => {
            act(() => {
                jest.advanceTimersByTime(step);
            });
            elapsed += step;
            corner += 1;
            movePointer(100 + (corner % 2) * 30, 100);
        };

        hover(FILTER_KEYS.FROM);
        while (elapsed < CONST.TIMING.SEARCH_FILTER_HOVER_INTENT_MAX_DELAY - step) {
            wander();
        }
        expect(mockReadyByFilter[FILTER_KEYS.FROM]).toBe(false);

        wander();
        expect(mockReadyByFilter[FILTER_KEYS.FROM]).toBe(true);
    });

    it('releases the row the cursor left from when it leaves the list without settling', () => {
        hover(FILTER_KEYS.FROM);
        leaveList();

        expect(mockReadyByFilter[FILTER_KEYS.FROM]).toBe(true);
    });

    it('goes on rendering a hidden content with the values it was last given', () => {
        mockFiltersForm = {from: ['9']};
        // The useOnyx mock serves a module variable and cannot re-render on its own, so a visit to another row is what
        // carries a new form into the popup.
        hoverAndRest(FILTER_KEYS.STATUS);
        hoverAndRest(FILTER_KEYS.FROM);

        // A filter this content does not read changes, so it stays mounted rather than being rebuilt.
        mockFiltersForm = {from: ['9'], to: ['1']};
        hoverAndRest(FILTER_KEYS.STATUS);

        expect(mockValuesByFilter[FILTER_KEYS.FROM]).toEqual({from: ['9']});
    });

    it('hands the shown content the live form rather than the values it was mounted on', () => {
        mockFiltersForm = {from: ['9']};
        hoverAndRest(FILTER_KEYS.STATUS);
        hoverAndRest(FILTER_KEYS.FROM);

        // The form changes while this filter stays the shown one, so it has to follow rather than hold its snapshot.
        mockFiltersForm = {from: ['9'], to: ['1']};
        rerenderPopup();

        expect(mockValuesByFilter[FILTER_KEYS.FROM]).toEqual({from: ['9'], to: ['1']});
    });

    it('makes a remounted content wait for the cursor again before it derives itself', () => {
        hoverAndRest(FILTER_KEYS.FROM);

        // Someone was picked in this very filter, so its content has to decide its selection pinning again.
        mockFiltersForm = {from: ['1']};
        hoverAndRest(FILTER_KEYS.TO);

        hover(FILTER_KEYS.FROM);
        expect(mockOnContentCreated.mock.calls.filter(([filterKey]) => filterKey === FILTER_KEYS.FROM)).toHaveLength(2);
        // The rebuilt instance is as expensive as a new one, so being shown is not enough for it to derive.
        expect(mockReadyByFilter[FILTER_KEYS.FROM]).toBe(false);

        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.SEARCH_FILTER_HOVER_INTENT_DELAY);
        });
        expect(mockReadyByFilter[FILTER_KEYS.FROM]).toBe(true);
    });

    it('keeps a mounted content when only a filter it does not read changed', () => {
        hoverAndRest(FILTER_KEYS.FROM);

        // Someone was picked in another filter, which the content of this one neither reads nor renders.
        mockFiltersForm = {to: ['1']};
        hoverAndRest(FILTER_KEYS.TO);

        // The content is revealed as it was left, so state it holds itself - a typed search term - survives.
        hoverAndRest(FILTER_KEYS.FROM);
        expect(mockOnContentCreated.mock.calls.filter(([filterKey]) => filterKey === FILTER_KEYS.FROM)).toHaveLength(1);
    });

    it('withholds nothing from a row focused with the keyboard', () => {
        focus(FILTER_KEYS.FROM);

        // No timer is advanced: moving focus is deliberate and never passes over rows on the way.
        expect(screen.getByTestId(`filter-content-${FILTER_KEYS.FROM}`)).toBeTruthy();
        expect(mockReadyByFilter[FILTER_KEYS.FROM]).toBe(true);
    });
});
