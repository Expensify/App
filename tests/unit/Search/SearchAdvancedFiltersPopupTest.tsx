import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {PressableWithoutFeedback} from '@components/Pressable';
import type {SearchQueryJSON} from '@components/Search/types';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React, {useRef} from 'react';
import {StyleSheet, View} from 'react-native';

// jest.mock factories can't reference imported bindings, but `mock`-prefixed locals are allowed.
const MockView = View;
const MockPressable = PressableWithoutFeedback;
const mockUseRef = useRef;

const FILTER_KEYS = CONST.SEARCH.SYNTAX_FILTER_KEYS;
const mockHoverableFilterKeys: string[] = [FILTER_KEYS.TYPE, FILTER_KEYS.FROM, FILTER_KEYS.TO, FILTER_KEYS.ATTENDEE];

/** Called once per mounted filter content instance, so a remount shows up as a second call for the same key. */
const mockOnContentCreated = jest.fn<void, [string]>();

jest.mock('@components/SafeTriangle', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => <MockView>{children}</MockView>,
}));

// Only holds Onyx subscriptions (which need providers not present here) and renders nothing.
jest.mock('@components/Search/FilterComponents/PersonalDetailOptionsKeepWarm', () => ({
    __esModule: true,
    default: () => null,
}));

// Stand-in for the filter list: one pressable per filter that reports a hover on the row.
jest.mock('@components/Search/FilterComponents/AdvancedFilters/FilterList', () => ({
    __esModule: true,
    default: ({onHoverIn}: {onHoverIn: (filterKey: string) => void}) => (
        <MockView>
            {mockHoverableFilterKeys.map((filterKey) => (
                <MockPressable
                    key={filterKey}
                    testID={`hover-${filterKey}`}
                    accessibilityLabel={filterKey}
                    role="menuitem"
                    onPress={() => onHoverIn(filterKey)}
                />
            ))}
        </MockView>
    ),
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
    default: () => [undefined, {status: 'loaded'}],
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

/**
 * Resolves whether a mounted filter content is the shown one or is kept in the background. Backgrounded contents are
 * taken out of the layout flow by their wrapper (the visibility part of the style is web-only, so it is empty here).
 */
function isContentShown(filterKey: string) {
    let wrapper = screen.getByTestId(`filter-content-${filterKey}`).parent;
    while (wrapper && wrapper.props.style === undefined) {
        wrapper = wrapper.parent;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- ReactTestInstance props are typed as `any`
    const style = StyleSheet.flatten(wrapper?.props.style as StyleProp<ViewStyle>);
    return style?.position !== 'absolute';
}

/** Moves the cursor onto a filter row and leaves it there long enough for the content to follow. */
function hoverAndRest(filterKey: string) {
    hover(filterKey);
    act(() => {
        jest.advanceTimersByTime(CONST.TIMING.SEARCH_FILTER_HOVER_INTENT_DELAY);
    });
}

beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
});

afterEach(() => {
    jest.useRealTimers();
});

describe('SearchAdvancedFiltersPopup', () => {
    it('does not mount the content of filters the cursor only passes over', () => {
        render(<SearchAdvancedFiltersPopup queryJSON={queryJSON} />);

        // A fast sweep: every row is left again before the hover intent delay elapses.
        for (const filterKey of [FILTER_KEYS.FROM, FILTER_KEYS.TO, FILTER_KEYS.ATTENDEE]) {
            hover(filterKey);
            act(() => {
                jest.advanceTimersByTime(CONST.TIMING.SEARCH_FILTER_HOVER_INTENT_DELAY - 1);
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
        // The revisited content is the shown one again, while the one left behind stays mounted but hidden.
        expect(isContentShown(FILTER_KEYS.FROM)).toBe(true);
        expect(isContentShown(FILTER_KEYS.TO)).toBe(false);
    });

    it('keeps only the most recently used contents mounted', () => {
        render(<SearchAdvancedFiltersPopup queryJSON={queryJSON} />);

        // Visiting one filter more than MAX_MOUNTED_FILTER_CONTENTS keeps mounted evicts the least recently used one.
        hoverAndRest(FILTER_KEYS.FROM);
        hoverAndRest(FILTER_KEYS.TO);
        hoverAndRest(FILTER_KEYS.ATTENDEE);

        expect(screen.queryByTestId(`filter-content-${FILTER_KEYS.TYPE}`, {includeHiddenElements: true})).toBeNull();
        expect(isContentShown(FILTER_KEYS.ATTENDEE)).toBe(true);

        // Returning to an evicted filter mounts a fresh content instance for it.
        hoverAndRest(FILTER_KEYS.TYPE);
        expect(mockOnContentCreated.mock.calls.filter(([filterKey]) => filterKey === FILTER_KEYS.TYPE)).toHaveLength(2);
    });
});
