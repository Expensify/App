import {act, render} from '@testing-library/react-native';

import type {SearchQueryJSON} from '@components/Search/types';

import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

import React, {useRef} from 'react';
import {View} from 'react-native';

// jest.mock factories can't reference imported bindings, but `mock`-prefixed locals are allowed.
const MockView = View;
const mockUseRef = useRef;

const FILTER_KEYS = CONST.SEARCH.SYNTAX_FILTER_KEYS;

/** Called once per content instance, so a remount shows up as a second call for the same key. */
const mockOnContentCreated = jest.fn<void, [string]>();

/** What each mounted content was last told about deriving itself. */
let mockReadyByFilter: Record<string, boolean> = {};

/** How many times each content has rendered, so a render of a hidden one shows up here. */
let mockRenderCountByFilter: Record<string, number> = {};

/** The filter values each mounted content was last rendered with. */
let mockValuesByFilter: Record<string, Partial<SearchAdvancedFiltersForm> | undefined> = {};

// Captured from what the popup hands the filter list, so tests can drive the cursor and read what is highlighted.
let mockOnHoverIn: ((filterKey: string) => void) | undefined;
let mockOnFocus: ((filterKey: string) => void) | undefined;
let mockOnPointerMove: ((event: {clientX: number; clientY: number}) => void) | undefined;
let mockOnPointerLeave: (() => void) | undefined;
let mockSelectedFilter: string | undefined;

/** The form served by the useOnyx mock. Reassigned by tests to change filter values. */
let mockFiltersForm: Partial<SearchAdvancedFiltersForm> | undefined;

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

// Stand-in for the filter content, the expensive part being mounted or kept alive.
jest.mock('@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent', () => ({
    __esModule: true,
    default: ({baseFilterKey, ready, values}: {baseFilterKey: string; ready?: boolean; values?: Partial<SearchAdvancedFiltersForm>}) => {
        const isCreated = mockUseRef(false);
        if (!isCreated.current) {
            isCreated.current = true;
            mockOnContentCreated(baseFilterKey);
        }
        mockRenderCountByFilter[baseFilterKey] = (mockRenderCountByFilter[baseFilterKey] ?? 0) + 1;
        mockReadyByFilter[baseFilterKey] = !!ready;
        mockValuesByFilter[baseFilterKey] = values;

        return <MockView testID={`filter-content-${baseFilterKey}`} />;
    },
}));

// One callback for the life of the test, so props of an unvisited content stay identical.
const mockUpdateFilterQueryParams = jest.fn();
jest.mock('@components/Search/hooks/useUpdateFilterQuery', () => ({
    __esModule: true,
    default: () => ({updateFilterQueryParams: mockUpdateFilterQueryParams}),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [mockFiltersForm, {status: 'loaded'}],
}));

// The popover exists on web only, and jest-expo's resolver prefers the native variant, which renders nothing.
const SearchAdvancedFiltersPopup = require<{
    default: React.ComponentType<{queryJSON: SearchQueryJSON | undefined}>;
}>('../../../src/components/Search/FilterDropdowns/SearchAdvancedFiltersPopup/index.tsx').default;

/** Renders the popup again, which carries a reassigned form into it while the shown filter stays put. */
let rerenderPopup: () => void;

// Only forwarded to the mocked query hook, so it is never read.
const queryJSON = undefined;

/** Moves the cursor onto a filter row without waiting for the hover intent delay. */
function hover(filterKey: string) {
    act(() => {
        mockOnHoverIn?.(filterKey);
    });
}

/** Moves the cursor onto a filter row and leaves it there long enough to release what it withheld. */
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

/** Takes the cursor off the filter list. */
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
    mockRenderCountByFilter = {};
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
        for (const filterKey of peopleFilters) {
            hover(filterKey);
            act(() => {
                jest.advanceTimersByTime(12);
            });
        }

        // The pane kept up with the cursor, and not one of the rows it crossed built a contact list.
        expect(mockSelectedFilter).toBe(FILTER_KEYS.ASSIGNEE);
        for (const filterKey of peopleFilters) {
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

    it('releases the row the cursor left from when it leaves the list without settling', () => {
        hover(FILTER_KEYS.FROM);
        leaveList();

        expect(mockReadyByFilter[FILTER_KEYS.FROM]).toBe(true);
    });

    it('hands the shown content the live form and a hidden one the values it was last shown with', () => {
        mockFiltersForm = {from: ['9']};
        // The useOnyx mock cannot re-render on its own, so a visit to another row carries the new form into the popup.
        hoverAndRest(FILTER_KEYS.STATUS);
        hoverAndRest(FILTER_KEYS.FROM);

        // The form changes while this filter is the shown one, so it follows rather than holding its snapshot.
        mockFiltersForm = {from: ['9'], to: ['1']};
        rerenderPopup();
        expect(mockValuesByFilter[FILTER_KEYS.FROM]).toEqual({from: ['9'], to: ['1']});

        // Hidden, it keeps those values rather than following the form on.
        mockFiltersForm = {from: ['9'], to: ['1'], category: ['food']};
        hoverAndRest(FILTER_KEYS.STATUS);
        expect(mockValuesByFilter[FILTER_KEYS.FROM]).toEqual({from: ['9'], to: ['1']});
    });

    it('makes a remounted content wait for the cursor again before it derives itself', () => {
        hoverAndRest(FILTER_KEYS.FROM);

        // Someone was picked in this very filter, so its content has to decide its selection pinning again.
        mockFiltersForm = {from: ['1']};
        rerenderPopup();
        const rendersBeforeLeaving = mockRenderCountByFilter[FILTER_KEYS.FROM];

        hoverAndRest(FILTER_KEYS.TO);
        // Hiding it hands back what it was already rendering, so the rebuild is the only cost.
        expect(mockRenderCountByFilter[FILTER_KEYS.FROM]).toBe(rendersBeforeLeaving);

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

        // The content is revealed as it was left, so state it holds itself survives.
        hoverAndRest(FILTER_KEYS.FROM);
        expect(mockOnContentCreated.mock.calls.filter(([filterKey]) => filterKey === FILTER_KEYS.FROM)).toHaveLength(1);
    });

    it('withholds nothing from a row focused with the keyboard', () => {
        focus(FILTER_KEYS.FROM);

        // No timer is advanced: moving focus is deliberate and never passes over rows on the way.
        expect(mockReadyByFilter[FILTER_KEYS.FROM]).toBe(true);
    });
});
