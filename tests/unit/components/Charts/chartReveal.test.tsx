import {act, render, screen} from '@testing-library/react-native';

import ActivityIndicator from '@components/ActivityIndicator';
import ChartReveal, {HOLD_FRAMES, useReportChartLoading} from '@components/Charts/components/ChartReveal';
import {getCartesianChartHeight} from '@components/Charts/utils/chartHeights';
import Text from '@components/Text';

import React from 'react';

const LOADING_HEIGHT = getCartesianChartHeight();

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

type ChartBodyProps = {
    isLoading: boolean;
    label: string;
};

function ChartBody({isLoading, label}: ChartBodyProps) {
    useReportChartLoading(isLoading);
    return isLoading ? null : <Text>{label}</Text>;
}

function EngineDownloading() {
    return null;
}

function renderChart(isLoading: boolean, label = 'chart') {
    return (
        <ChartReveal loadingHeight={LOADING_HEIGHT}>
            <ChartBody
                isLoading={isLoading}
                label={label}
            />
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

    it('should keep the spinner over the mounted chart until the last held frame', () => {
        // Given a chart whose data has just become ready
        render(renderChart(false));

        // When every held frame but the last passes
        runFrames(HOLD_FRAMES - 1);

        // Then the chart is mounted but still covered, because Skia may not have drawn it yet
        expect(screen.getByText('chart')).toBeTruthy();
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).not.toBeNull();

        // When the last held frame passes
        runFrames(1);

        // Then the spinner goes away, since the hold has outlasted Skia's first draw
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
    });

    it('should keep one spinner from the engine download until the reveal', () => {
        // Given a chart whose engine is still downloading, so nothing below has reported yet
        const {rerender} = render(
            <ChartReveal loadingHeight={LOADING_HEIGHT}>
                <EngineDownloading />
            </ChartReveal>,
        );
        const downloadSpinner = screen.UNSAFE_getByType(ActivityIndicator);
        runFrames(HOLD_FRAMES);

        // When the chart replaces the download placeholder, loads, and then gets its data
        rerender(renderChart(true));
        const loadingSpinner = screen.UNSAFE_getByType(ActivityIndicator);
        rerender(renderChart(false));

        // Then the spinner covering the hold is the one shown during the download,
        // because a new one would restart its rotation at each of those steps
        expect(loadingSpinner).toBe(downloadSpinner);
        expect(screen.UNSAFE_getByType(ActivityIndicator)).toBe(downloadSpinner);
    });

    it('should not hold again when a revealed chart gets new data', () => {
        // Given a chart that has been revealed
        const {rerender} = render(renderChart(false));
        runFrames(HOLD_FRAMES);

        // When its data changes without it loading again
        rerender(renderChart(false, 'updated chart'));

        // Then it updates in place, since Skia redraws a mounted chart without a blank frame
        expect(screen.getByText('updated chart')).toBeTruthy();
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
    });

    it('should hold again when a revealed chart reloads', () => {
        // Given a chart that has been revealed
        const {rerender} = render(renderChart(false));
        runFrames(HOLD_FRAMES);

        // When it loads again and its new data arrives
        rerender(renderChart(true));
        rerender(renderChart(false));

        // Then the remounted chart is covered again, because Skia has to draw it from scratch
        expect(screen.getByText('chart')).toBeTruthy();
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).not.toBeNull();
    });

    it('should restart the hold when a chart reloads before its hold ends', () => {
        // Given a chart partway through its hold
        const {rerender} = render(renderChart(false));
        runFrames(HOLD_FRAMES - 2);

        // When it loads again and its new data arrives
        rerender(renderChart(true));
        rerender(renderChart(false));
        runFrames(HOLD_FRAMES - 1);

        // Then it is still covered one frame short of a full hold, because the frames counted before the reload
        // belonged to a chart Skia no longer shows
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).not.toBeNull();

        // When the last frame of the new hold passes
        runFrames(1);

        // Then the spinner goes away, since the new hold has outlasted Skia's first draw of the remounted chart
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
    });

    it('should stop counting frames when the chart unmounts during its hold', () => {
        // Given a chart partway through its hold
        const {unmount} = render(renderChart(false));
        runFrames(1);

        // When it unmounts, as it does when the user leaves the page
        unmount();

        // Then no frame is left waiting to reveal it, since that would update a component that is gone
        expect(pendingFrames.size).toBe(0);
    });
});
