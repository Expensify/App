import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {PressableWithoutFeedback} from '@components/Pressable';
import type {SearchQueryJSON} from '@components/Search/types';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

import React, {useRef} from 'react';
import {View} from 'react-native';

// jest.mock factories can't reference imported bindings, but `mock`-prefixed locals are allowed.
const MockView = View;
const MockPressable = PressableWithoutFeedback;
const mockUseRef = useRef;

const FILTER_KEYS = CONST.SEARCH.SYNTAX_FILTER_KEYS;
const mockHoverableFilterKeys: string[] = [FILTER_KEYS.TYPE, FILTER_KEYS.FROM, FILTER_KEYS.TO, FILTER_KEYS.ATTENDEE];

/** Called once per mounted filter content instance, so a remount shows up as a second call for the same key. */
const mockOnContentCreated = jest.fn<void, [string]>();

/** The pointer move handler the popup hands to the filter list, captured so tests can drive the cursor. */
let mockOnPointerMove: ((event: {clientX: number; clientY: number}) => void) | undefined;

/** The advanced filters form value served by the useOnyx mock. Reassigned by tests simulating filter value changes. */
let mockFiltersForm: Partial<SearchAdvancedFiltersForm> | undefined;

jest.mock('@components/SafeTriangle', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => <MockView>{children}</MockView>,
}));

// Stand-in for the filter list: per filter, one pressable reporting a hover on the row and one reporting focus on it.
jest.mock('@components/Search/FilterComponents/AdvancedFilters/FilterList', () => ({
    __esModule: true,
    default: ({
        onHoverIn,
        onFocus,
        onPointerMove,
    }: {
        onHoverIn: (filterKey: string) => void;
        onFocus: (filterKey: string) => void;
        onPointerMove: (event: {clientX: number; clientY: number}) => void;
    }) => {
        mockOnPointerMove = onPointerMove;

        return (
            <MockView>
                {mockHoverableFilterKeys.map((filterKey) => (
                    <MockView key={filterKey}>
                        <MockPressable
                            testID={`hover-${filterKey}`}
                            accessibilityLabel={filterKey}
                            role="menuitem"
                            onPress={() => onHoverIn(filterKey)}
                        />
                        <MockPressable
                            testID={`focus-${filterKey}`}
                            accessibilityLabel={filterKey}
                            role="menuitem"
                            onPress={() => onFocus(filterKey)}
                        />
                    </MockView>
                ))}
            </MockView>
        );
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

/** Moves the cursor onto a filter row without waiting for the hover intent delay to pass. */
function hover(filterKey: string) {
    fireEvent.press(screen.getByTestId(`hover-${filterKey}`));
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

/** Moves the keyboard focus onto a filter row. */
function focus(filterKey: string) {
    fireEvent.press(screen.getByTestId(`focus-${filterKey}`));
}

beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockFiltersForm = undefined;
    mockOnPointerMove = undefined;
});

afterEach(() => {
    jest.useRealTimers();
});

describe('SearchAdvancedFiltersPopup', () => {
    it('keeps the content hidden while the cursor is still traveling over a row', () => {
        render(<SearchAdvancedFiltersPopup queryJSON={queryJSON} />);

        hover(FILTER_KEYS.FROM);
        // The cursor crosses the row without ever pausing on it for the rest delay, and within the dwell allowance.
        for (let step = 1; step <= 2; step++) {
            act(() => {
                jest.advanceTimersByTime(15);
            });
            movePointer(100, 100 + step * 20);
        }

        expect(mockOnContentCreated).not.toHaveBeenCalledWith(FILTER_KEYS.FROM);

        // It comes to rest, and the content follows without waiting for the full dwell allowance.
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.SEARCH_FILTER_HOVER_INTENT_DELAY);
        });

        expect(mockOnContentCreated).toHaveBeenCalledWith(FILTER_KEYS.FROM);
    });

    it('treats a cursor that only shakes on the spot as at rest', () => {
        render(<SearchAdvancedFiltersPopup queryJSON={queryJSON} />);

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
        render(<SearchAdvancedFiltersPopup queryJSON={queryJSON} />);

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
        render(<SearchAdvancedFiltersPopup queryJSON={queryJSON} />);

        for (const filterKey of [FILTER_KEYS.FROM, FILTER_KEYS.TO, FILTER_KEYS.ATTENDEE]) {
            hover(filterKey);
            movePointer(100, 100 + mockHoverableFilterKeys.indexOf(filterKey) * 30);
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

    it('does not mount the content of filters the cursor only passes over', () => {
        render(<SearchAdvancedFiltersPopup queryJSON={queryJSON} />);

        // A fast sweep: every row is left again well before the hover intent delay elapses.
        for (const filterKey of [FILTER_KEYS.FROM, FILTER_KEYS.TO, FILTER_KEYS.ATTENDEE]) {
            hover(filterKey);
            act(() => {
                jest.advanceTimersByTime(1);
            });
        }
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.SEARCH_FILTER_HOVER_INTENT_DELAY);
        });

        // Only the row the cursor came to rest on was mounted, the two it swept over were not.
        expect(mockOnContentCreated).toHaveBeenCalledWith(FILTER_KEYS.ATTENDEE);
        expect(mockOnContentCreated).not.toHaveBeenCalledWith(FILTER_KEYS.FROM);
        expect(mockOnContentCreated).not.toHaveBeenCalledWith(FILTER_KEYS.TO);
    });

    it('reuses the content of a filter that was already visited instead of remounting it', () => {
        render(<SearchAdvancedFiltersPopup queryJSON={queryJSON} />);

        hoverAndRest(FILTER_KEYS.FROM);
        hoverAndRest(FILTER_KEYS.TO);
        hoverAndRest(FILTER_KEYS.FROM);

        expect(mockOnContentCreated.mock.calls.filter(([filterKey]) => filterKey === FILTER_KEYS.FROM)).toHaveLength(1);
    });

    it('remounts a kept content when the filters form changed while it was away', () => {
        render(<SearchAdvancedFiltersPopup queryJSON={queryJSON} />);

        hoverAndRest(FILTER_KEYS.FROM);

        // The form changes in a way this content reads (the search type decides its options) and the cursor moves on.
        mockFiltersForm = {type: CONST.SEARCH.DATA_TYPES.EXPENSE};
        hoverAndRest(FILTER_KEYS.TO);

        // Returning to the filter now gets a fresh content instance instead of the one from before the change.
        hoverAndRest(FILTER_KEYS.FROM);
        expect(mockOnContentCreated.mock.calls.filter(([filterKey]) => filterKey === FILTER_KEYS.FROM)).toHaveLength(2);
    });

    it('remounts a kept content when its own value changed while it was away', () => {
        render(<SearchAdvancedFiltersPopup queryJSON={queryJSON} />);

        hoverAndRest(FILTER_KEYS.FROM);

        // Someone was picked in this very filter, so its content has to decide its selection pinning again.
        mockFiltersForm = {from: ['1']};
        hoverAndRest(FILTER_KEYS.TO);

        hoverAndRest(FILTER_KEYS.FROM);
        expect(mockOnContentCreated.mock.calls.filter(([filterKey]) => filterKey === FILTER_KEYS.FROM)).toHaveLength(2);
    });

    it('keeps a kept content when only the value of a filter it does not read changed', () => {
        render(<SearchAdvancedFiltersPopup queryJSON={queryJSON} />);

        hoverAndRest(FILTER_KEYS.FROM);

        // Someone was picked in another filter, which the content of this one neither reads nor renders.
        mockFiltersForm = {to: ['1']};
        hoverAndRest(FILTER_KEYS.TO);

        // The content is revealed as it was left, so state it holds itself - a typed search term - survives.
        hoverAndRest(FILTER_KEYS.FROM);
        expect(mockOnContentCreated.mock.calls.filter(([filterKey]) => filterKey === FILTER_KEYS.FROM)).toHaveLength(1);
    });

    it('shows the content of a row focused with the keyboard without waiting for the hover intent delay', () => {
        render(<SearchAdvancedFiltersPopup queryJSON={queryJSON} />);

        focus(FILTER_KEYS.FROM);

        // No timer is advanced: moving focus is deliberate, so its content follows in the same frame.
        expect(mockOnContentCreated).toHaveBeenCalledWith(FILTER_KEYS.FROM);
        expect(screen.getByTestId(`filter-content-${FILTER_KEYS.FROM}`)).toBeTruthy();
    });

    it('does not let a pending hover replace the content of the row focused after it', () => {
        render(<SearchAdvancedFiltersPopup queryJSON={queryJSON} />);

        // The cursor passes over a row and the keyboard moves focus elsewhere before the delay elapses.
        hover(FILTER_KEYS.TO);
        focus(FILTER_KEYS.FROM);
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.SEARCH_FILTER_HOVER_INTENT_DELAY);
        });

        expect(mockOnContentCreated).not.toHaveBeenCalledWith(FILTER_KEYS.TO);
        expect(screen.getByTestId(`filter-content-${FILTER_KEYS.FROM}`)).toBeTruthy();
    });

    it('keeps only the most recently used contents mounted', () => {
        render(<SearchAdvancedFiltersPopup queryJSON={queryJSON} />);

        // Visiting more filters than MAX_MOUNTED_FILTER_CONTENTS evicts the least recently used one.
        hoverAndRest(FILTER_KEYS.FROM);
        hoverAndRest(FILTER_KEYS.TO);
        hoverAndRest(FILTER_KEYS.ATTENDEE);
        expect(screen.queryByTestId(`filter-content-${FILTER_KEYS.TYPE}`, {includeHiddenElements: true})).toBeNull();

        // Returning to an evicted filter mounts a fresh content instance for it.
        hoverAndRest(FILTER_KEYS.TYPE);
        expect(mockOnContentCreated.mock.calls.filter(([filterKey]) => filterKey === FILTER_KEYS.TYPE)).toHaveLength(2);
    });
});
