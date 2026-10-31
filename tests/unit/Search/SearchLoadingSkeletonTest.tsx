import {fireEvent, render, screen} from '@testing-library/react-native';

import SearchLoadingSkeleton from '@components/Search/SearchLoadingSkeleton';

import {IsInPreloadedTabContext} from '@hooks/useIsInPreloadedTab';
import {PreloadedTabContentReadyContext} from '@hooks/useMarkPreloadedTabContentReady';

import CONST from '@src/CONST';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';

const mockEndSpanWithAttributes = jest.fn<void, unknown[]>();
const mockEndNavigateToReportsFirstPaint = jest.fn<void, unknown[]>();
// The latest focus callback the skeleton registered, so a test can focus the screen when it chooses.
let mockFocusCallback: (() => void) | undefined;

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');
    return {
        ...actualNavigation,
        useFocusEffect: (callback: () => void) => {
            mockFocusCallback = callback;
        },
    };
});

jest.mock('@libs/telemetry/activeSpans', () => ({
    endSpanWithAttributes: (...args: unknown[]) => mockEndSpanWithAttributes(...args),
}));

jest.mock('@libs/telemetry/navigateToReportsSpans', () => ({
    endNavigateToReportsFirstPaint: (...args: unknown[]) => mockEndNavigateToReportsFirstPaint(...args),
}));

jest.mock('@components/Skeletons/SearchRowSkeleton', () => () => null);

function focusScreen() {
    mockFocusCallback?.();
}

function layOutSkeleton() {
    fireEvent(screen.root, 'layout', {nativeEvent: {layout: {x: 0, y: 0, width: 400, height: 800}}});
}

function expectColdSpansEnded(times: number) {
    expect(mockEndSpanWithAttributes).toHaveBeenCalledTimes(times);
    expect(mockEndSpanWithAttributes).toHaveBeenCalledWith(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS, {[CONST.TELEMETRY.ATTRIBUTE_IS_WARM]: false});
    expect(mockEndNavigateToReportsFirstPaint).toHaveBeenCalledTimes(times);
    expect(mockEndNavigateToReportsFirstPaint).toHaveBeenCalledWith(CONST.TELEMETRY.NAVIGATE_TO_REPORTS_START_TYPE.COLD);
}

describe('SearchLoadingSkeleton', () => {
    beforeEach(() => {
        mockEndSpanWithAttributes.mockClear();
        mockEndNavigateToReportsFirstPaint.mockClear();
        mockFocusCallback = undefined;
    });

    it('ends the cold spans on its first layout during a normal visit', () => {
        // Given the skeleton mounts on a screen the user just opened, so focus arrives before the first layout
        render(<SearchLoadingSkeleton />);
        focusScreen();
        expect(mockEndSpanWithAttributes).not.toHaveBeenCalled();

        // When the skeleton is laid out
        layOutSkeleton();

        // Then the tap's spans end once, as a cold start, at the moment the skeleton appears
        expectColdSpansEnded(1);

        // And a return to the tab while it still loads leaves the next tap's spans to whatever paints next
        focusScreen();
        expectColdSpansEnded(1);
    });

    it('ends the cold spans on focus when it was laid out while its tab was hidden', () => {
        // Given the idle tab preload mounted and laid out the skeleton before the user opened the tab
        const {rerender} = render(
            <IsInPreloadedTabContext.Provider value>
                <SearchLoadingSkeleton />
            </IsInPreloadedTabContext.Provider>,
        );
        layOutSkeleton();
        // That hidden layout ends nothing, since no tap is waiting on it yet
        expect(mockEndSpanWithAttributes).not.toHaveBeenCalled();

        // When the user opens the tab, which brings no new layout because the skeleton is already on screen
        rerender(
            <IsInPreloadedTabContext.Provider value={false}>
                <SearchLoadingSkeleton />
            </IsInPreloadedTabContext.Provider>,
        );
        focusScreen();

        // Then the tap's spans end on that focus, as a cold start, since no new layout will follow
        expectColdSpansEnded(1);
    });

    it('reports its tab content as ready once it is laid out', () => {
        // Given the skeleton is the first content of a tab preloaded at idle, which holds its request until opened
        const markPreloadedTabContentReady = jest.fn();
        render(
            <PreloadedTabContentReadyContext.Provider value={markPreloadedTabContentReady}>
                <SearchLoadingSkeleton />
            </PreloadedTabContentReadyContext.Provider>,
        );
        expect(markPreloadedTabContentReady).not.toHaveBeenCalled();

        // When the skeleton is laid out
        layOutSkeleton();

        // Then the tab learns its content is on screen, so it can freeze instead of re-rendering while hidden
        expect(markPreloadedTabContentReady).toHaveBeenCalledTimes(1);
    });
});
