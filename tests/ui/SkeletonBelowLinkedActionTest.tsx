import {act, render, screen} from '@testing-library/react-native';

import {ActionListContext} from '@pages/inbox/ActionListContext';
import SkeletonBelowLinkedAction from '@pages/inbox/report/ReportActionsList/SkeletonBelowLinkedAction';

import React from 'react';

jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));

const LINKED_ACTION_INDEX = 4;
const pendingFrames: FrameRequestCallback[] = [];
const renderedRowIndices = new Set<number>();
const measuredRowSizes = new Map<number, number>();

// Queue animation frames so each measurement check runs only when the test flushes it.
jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => pendingFrames.push(callback));
jest.spyOn(global, 'cancelAnimationFrame').mockImplementation(() => {});

function flushFrames() {
    act(() => {
        for (const callback of pendingFrames.splice(0)) {
            callback(0);
        }
    });
}

// Built via a function so the value isn't an inline literal the context-split lint rule would flag; these are all refs/accessors with no re-render concern.
function buildActionListContextValue() {
    return {
        scrollOffsetRef: {current: 0},
        getScrollOffset: () => 0,
        registerListRef: () => {},
        getListRef: () => ({
            current: {
                scrollToIndex: jest.fn(),
                scrollToEnd: jest.fn(),
                scrollToOffset: jest.fn(),
                getState: () => ({
                    positionByKey: () => undefined,
                    sizeAtIndex: (index: number) => measuredRowSizes.get(index),
                    elementAtIndex: (index: number) => (renderedRowIndices.has(index) ? {} : undefined),
                }),
            },
        }),
    };
}

function renderSkeleton(hasNewerRows: boolean, onNewerRowMeasured: () => void) {
    return render(
        <ActionListContext.Provider value={buildActionListContextValue()}>
            <SkeletonBelowLinkedAction
                linkedActionIndex={LINKED_ACTION_INDEX}
                hasNewerRows={hasNewerRows}
                onNewerRowMeasured={onNewerRowMeasured}
            />
        </ActionListContext.Provider>,
    );
}

describe('SkeletonBelowLinkedAction', () => {
    beforeEach(() => {
        pendingFrames.length = 0;
        renderedRowIndices.clear();
        measuredRowSizes.clear();
    });

    it('stays until LegendList measures the first row below the linked action', () => {
        // Given a linked action whose newer page has not loaded yet.
        const onNewerRowMeasured = jest.fn();
        const view = renderSkeleton(false, onNewerRowMeasured);
        flushFrames();

        // Then the skeleton covers the area, and nothing is checked before rows exist below the link.
        expect(screen.getByTestId('ReportActionsSkeletonView')).toBeTruthy();
        expect(onNewerRowMeasured).not.toHaveBeenCalled();

        // When the newer page adds a row that LegendList has rendered but not measured, so it is still hidden.
        renderedRowIndices.add(LINKED_ACTION_INDEX + 1);
        view.rerender(
            <ActionListContext.Provider value={buildActionListContextValue()}>
                <SkeletonBelowLinkedAction
                    linkedActionIndex={LINKED_ACTION_INDEX}
                    hasNewerRows
                    onNewerRowMeasured={onNewerRowMeasured}
                />
            </ActionListContext.Provider>,
        );
        flushFrames();

        // Then the skeleton stays, because removing it would leave the area blank until the row is revealed.
        expect(screen.getByTestId('ReportActionsSkeletonView')).toBeTruthy();
        expect(onNewerRowMeasured).not.toHaveBeenCalled();

        // When LegendList measures the row, which also reveals it.
        measuredRowSizes.set(LINKED_ACTION_INDEX + 1, 80);
        flushFrames();

        // Then the skeleton hides at once, because the revealed row now fills the area, and it calls back so the list stops rendering it.
        expect(screen.queryByTestId('ReportActionsSkeletonView')).toBeNull();
        expect(onNewerRowMeasured).toHaveBeenCalledTimes(1);
    });

    it('goes away when the first newer row is off screen', () => {
        // Given newer rows below the link, but the first one has no container because the reader scrolled far away.
        const onNewerRowMeasured = jest.fn();
        renderSkeleton(true, onNewerRowMeasured);

        // When the check runs.
        flushFrames();

        // Then the skeleton goes away, because LegendList will not render that row until it comes back into range.
        expect(screen.queryByTestId('ReportActionsSkeletonView')).toBeNull();
        expect(onNewerRowMeasured).toHaveBeenCalledTimes(1);
    });
});
