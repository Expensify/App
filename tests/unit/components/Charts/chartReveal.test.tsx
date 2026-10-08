import {act, render, screen} from '@testing-library/react-native';

import ActivityIndicator from '@components/ActivityIndicator';
import ChartReveal from '@components/Charts/components/ChartReveal';
import Text from '@components/Text';

import React from 'react';

const LOADING_HEIGHT = 289;

let pendingFrames = new Map<number, FrameRequestCallback>();
let lastFrameID = 0;

function runFrames(count: number) {
    for (let frame = 0; frame < count; frame++) {
        const callbacks = [...pendingFrames.values()];
        pendingFrames.clear();
        act(() => {
            for (const callback of callbacks) {
                callback(0);
            }
        });
    }
}

function renderChart(isLoading: boolean, label = 'chart') {
    return (
        <ChartReveal
            isLoading={isLoading}
            loadingHeight={LOADING_HEIGHT}
        >
            <Text>{label}</Text>
        </ChartReveal>
    );
}

describe('ChartReveal', () => {
    beforeEach(() => {
        pendingFrames = new Map();
        jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
            lastFrameID += 1;
            pendingFrames.set(lastFrameID, callback);
            return lastFrameID;
        });
        jest.spyOn(global, 'cancelAnimationFrame').mockImplementation((frameID) => {
            if (frameID === null || frameID === undefined) {
                return;
            }
            pendingFrames.delete(frameID);
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should keep the spinner over the mounted chart until the fifth frame', () => {
        // Given a chart whose data has just become ready
        render(renderChart(false));

        // When four frames pass
        runFrames(4);

        // Then the chart is mounted but still covered
        expect(screen.getByText('chart')).toBeTruthy();
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).not.toBeNull();

        // When the fifth frame passes
        runFrames(1);

        // Then the spinner goes away
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
    });

    it('should keep the same spinner from loading through the hold', () => {
        // Given a chart that is still loading
        const {rerender} = render(renderChart(true));
        const loadingSpinner = screen.UNSAFE_getByType(ActivityIndicator);

        // When its data becomes ready
        rerender(renderChart(false));

        // Then the spinner covering the hold is the one shown while loading,
        // because a new one would restart its rotation at the moment the data arrives
        expect(screen.UNSAFE_getByType(ActivityIndicator)).toBe(loadingSpinner);
    });

    it('should not hold again when a revealed chart gets new data', () => {
        // Given a chart that has been revealed
        const {rerender} = render(renderChart(false));
        runFrames(5);

        // When its data changes without it loading again
        rerender(renderChart(false, 'updated chart'));

        // Then it updates in place, since Skia redraws a mounted chart without a blank frame
        expect(screen.getByText('updated chart')).toBeTruthy();
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
    });

    it('should hold again when a revealed chart reloads', () => {
        // Given a chart that has been revealed
        const {rerender} = render(renderChart(false));
        runFrames(5);

        // When it loads again and its new data arrives
        rerender(renderChart(true));
        rerender(renderChart(false));

        // Then the remounted chart is covered again, because Skia has to draw it from scratch
        expect(screen.getByText('chart')).toBeTruthy();
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).not.toBeNull();
    });
});
