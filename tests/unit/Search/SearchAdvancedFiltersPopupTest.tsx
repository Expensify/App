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
    default: ({baseFilterKey}: {baseFilterKey: string}) => {
        const isCreated = mockUseRef(false);
        if (!isCreated.current) {
            isCreated.current = true;
            mockOnContentCreated(baseFilterKey);
        }

        return <MockView testID={`filter-content-${baseFilterKey}`} />;
    },
}));

jest.mock('@components/Search/hooks/useUpdateFilterQuery', () => ({
    __esModule: true,
    default: () => ({setFilterQueryParams: jest.fn(), updateFilterQueryParams: jest.fn()}),
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
const queryJSON = buildSearchQueryJSON(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE}`);

/** Moves the cursor onto a filter row without waiting for the hover intent delay. */
function hover(filterKey: string) {
    act(() => {
        mockOnHoverIn?.(filterKey);
    });
}

/** Moves the cursor onto a filter row and leaves it there long enough for the content to follow. */
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
    render(<SearchAdvancedFiltersPopup queryJSON={queryJSON} />);
});

afterEach(() => {
    jest.useRealTimers();
});

describe('SearchAdvancedFiltersPopup', () => {
    it('shows the row the cursor ended on when it leaves the list without settling', () => {
        // A flick across the rows and straight out of the popover, too fast for any of them to be settled on.
        for (const filterKey of [FILTER_KEYS.FROM, FILTER_KEYS.TO, FILTER_KEYS.ATTENDEE]) {
            hover(filterKey);
        }
        leaveList();

        // The marked row and the content on screen are the same one, and it is the row the cursor left from.
        expect(mockSelectedFilter).toBe(FILTER_KEYS.ATTENDEE);
        expect(mockOnContentCreated).toHaveBeenCalledWith(FILTER_KEYS.ATTENDEE);
        expect(mockOnContentCreated).not.toHaveBeenCalledWith(FILTER_KEYS.TO);
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

        expect(mockOnContentCreated).toHaveBeenCalledWith(FILTER_KEYS.FROM);
    });

    it('shows the content of a row the cursor never comes to rest on', () => {
        hover(FILTER_KEYS.FROM);
        // Wandering around inside the row, always further than the rest radius: every step restarts the rest wait, so
        // only the row allowance can end it.
        for (let step = 1; step <= 25; step++) {
            act(() => {
                jest.advanceTimersByTime(CONST.TIMING.SEARCH_FILTER_HOVER_INTENT_DELAY - 10);
            });
            movePointer(100 + (step % 2) * 20, 100 + (step % 3) * 12);
        }

        expect(mockOnContentCreated).toHaveBeenCalledWith(FILTER_KEYS.FROM);
    });

    it('shows nothing while the cursor travels across several rows without stopping', () => {
        for (const [row, filterKey] of [FILTER_KEYS.FROM, FILTER_KEYS.TO, FILTER_KEYS.ATTENDEE].entries()) {
            hover(filterKey);
            movePointer(100, 100 + row * 30);
            act(() => {
                jest.advanceTimersByTime(12);
            });
        }

        expect(mockOnContentCreated).not.toHaveBeenCalledWith(FILTER_KEYS.FROM);
        expect(mockOnContentCreated).not.toHaveBeenCalledWith(FILTER_KEYS.TO);

        // Only the row it stopped on ends up shown.
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.SEARCH_FILTER_HOVER_INTENT_DELAY);
        });

        expect(mockOnContentCreated).toHaveBeenCalledWith(FILTER_KEYS.ATTENDEE);
    });

    it('reuses the content of a filter that was already visited instead of remounting it', () => {
        hoverAndRest(FILTER_KEYS.FROM);
        hoverAndRest(FILTER_KEYS.TO);
        hoverAndRest(FILTER_KEYS.FROM);

        expect(mockOnContentCreated.mock.calls.filter(([filterKey]) => filterKey === FILTER_KEYS.FROM)).toHaveLength(1);
    });

    it('remounts a kept content when its own value changed while it was away', () => {
        hoverAndRest(FILTER_KEYS.FROM);

        // Someone was picked in this very filter, so its content has to decide its selection pinning again.
        mockFiltersForm = {from: ['1']};
        hoverAndRest(FILTER_KEYS.TO);

        hoverAndRest(FILTER_KEYS.FROM);
        expect(mockOnContentCreated.mock.calls.filter(([filterKey]) => filterKey === FILTER_KEYS.FROM)).toHaveLength(2);
    });

    it('keeps a kept content when only the value of a filter it does not read changed', () => {
        hoverAndRest(FILTER_KEYS.FROM);

        // Someone was picked in another filter, which the content of this one neither reads nor renders.
        mockFiltersForm = {to: ['1']};
        hoverAndRest(FILTER_KEYS.TO);

        // The content is revealed as it was left, so state it holds itself - a typed search term - survives.
        hoverAndRest(FILTER_KEYS.FROM);
        expect(mockOnContentCreated.mock.calls.filter(([filterKey]) => filterKey === FILTER_KEYS.FROM)).toHaveLength(1);
    });

    it('shows the content of a row focused with the keyboard without waiting for the hover intent delay', () => {
        focus(FILTER_KEYS.FROM);

        // No timer is advanced: moving focus is deliberate, so its content follows in the same frame.
        expect(mockOnContentCreated).toHaveBeenCalledWith(FILTER_KEYS.FROM);
        expect(screen.getByTestId(`filter-content-${FILTER_KEYS.FROM}`)).toBeTruthy();
    });

    it('does not let a pending hover replace the content of the row focused after it', () => {
        // The cursor passes over a row and the keyboard moves focus elsewhere before the delay elapses.
        hover(FILTER_KEYS.TO);
        focus(FILTER_KEYS.FROM);
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.SEARCH_FILTER_HOVER_INTENT_DELAY);
        });

        expect(mockOnContentCreated).not.toHaveBeenCalledWith(FILTER_KEYS.TO);
        expect(screen.getByTestId(`filter-content-${FILTER_KEYS.FROM}`)).toBeTruthy();
    });
});
