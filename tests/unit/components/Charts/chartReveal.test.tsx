import {act, render, screen} from '@testing-library/react-native';

import ActivityIndicator from '@components/ActivityIndicator';
import ChartReveal, {HOLD_FRAMES, useReportChartLoading} from '@components/Charts/components/ChartReveal';
import {ChartCaptureContext} from '@components/Charts/context/ChartCaptureContext';
import {getCartesianChartHeight} from '@components/Charts/utils/chartHeights';
import Text from '@components/Text';

import React from 'react';
import * as Reanimated from 'react-native-reanimated';

const LOADING_HEIGHT = getCartesianChartHeight();

let pendingFrames = new Map<number, FrameRequestCallback>();
let lastFrameID = 0;

/** The worklets mock runs UI-thread work on a timer and calls back into React in a microtask, which the fake timers below hold */
function flushWorklets() {
    act(() => {
        jest.runOnlyPendingTimers();
    });
}

function runFrames(count: number) {
    flushWorklets();
    for (let frame = 0; frame < count; frame++) {
        const callbacks = [...pendingFrames.values()];
        pendingFrames.clear();
        act(() => {
            for (const callback of callbacks) {
                callback(0);
            }
        });
    }
    flushWorklets();
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

function renderChart(isLoading: boolean, label = 'chart', isCardMeasured = true) {
    return (
        <ChartReveal
            loadingHeight={LOADING_HEIGHT}
            isCardMeasured={isCardMeasured}
        >
            <ChartBody
                isLoading={isLoading}
                label={label}
            />
        </ChartReveal>
    );
}

describe('ChartReveal', () => {
    beforeEach(() => {
        jest.useFakeTimers();
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
        jest.useRealTimers();
    });

    it('should fade the chart in without a spinner when it is only waiting for its card to be measured', () => {
        // Given a chart whose data and fonts are already in memory, mounted before its card has been measured
        const {rerender} = render(renderChart(false, 'chart', false));

        // Then nothing covers the card, because the width comes from the card's first layout and a spinner would only flash
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();

        // When the card is measured
        rerender(renderChart(false));

        // Then the chart starts fading in at once rather than after a hold, since there is no spinner to keep up while Skia draws
        expect(screen.getByText('chart')).toBeTruthy();
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
        expect(pendingFrames.size).toBe(0);
    });

    it('should keep the spinner over the mounted chart until the last held frame', () => {
        // Given a chart that was loading and whose data has just become ready
        const {rerender} = render(renderChart(true));
        rerender(renderChart(false));

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
            <ChartReveal
                loadingHeight={LOADING_HEIGHT}
                isCardMeasured
            >
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
        // Given a chart that has been revealed after loading
        const {rerender} = render(renderChart(true));
        rerender(renderChart(false));
        runFrames(HOLD_FRAMES);

        // When its data changes without it loading again
        rerender(renderChart(false, 'updated chart'));

        // Then it updates in place, since Skia redraws a mounted chart without a blank frame
        expect(screen.getByText('updated chart')).toBeTruthy();
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
    });

    it('should bring the spinner back in the same render when a revealed chart loads again', () => {
        // Given a chart that has been revealed after loading
        const {rerender} = render(renderChart(true));
        rerender(renderChart(false));
        runFrames(HOLD_FRAMES);

        // When the card starts loading again, before the chart has reported it
        rerender(
            <ChartReveal
                isLoading
                loadingHeight={LOADING_HEIGHT}
                isCardMeasured
            >
                <ChartBody
                    isLoading={false}
                    label="chart"
                />
            </ChartReveal>,
        );

        // Then the spinner is back already, because an empty card for even one commit shrinks the page under the user
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).not.toBeNull();
    });

    it('should hold when a chart that faded in without a spinner reloads', () => {
        // Given a chart that faded in as soon as its card was measured
        const {rerender} = render(renderChart(false, 'chart', false));
        rerender(renderChart(false));

        // When it loads again and its new data arrives
        rerender(renderChart(true));
        rerender(renderChart(false));

        // Then the remounted chart is covered again, because Skia has to draw it from scratch
        expect(screen.getByText('chart')).toBeTruthy();
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).not.toBeNull();
    });

    it('should restart the hold when a chart reloads before its hold ends', () => {
        // Given a chart partway through its hold after loading
        const {rerender} = render(renderChart(true));
        rerender(renderChart(false));
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
        // Given a chart partway through its hold after loading
        const {rerender, unmount} = render(renderChart(true));
        rerender(renderChart(false));
        runFrames(1);

        // When it unmounts, as it does when the user leaves the page
        unmount();
        flushWorklets();

        // Then no frame is left waiting to reveal it, since that would update a component that is gone
        expect(pendingFrames.size).toBe(0);
    });

    it('blocks dashboard capture until Skia has drawn and the chart has finished fading in', () => {
        // Given a dashboard chart whose reveal animation has not completed
        const reportLoading = jest.fn<void, [string, boolean]>();
        const completions: Array<NonNullable<Parameters<typeof Reanimated.withTiming>[2]>> = [];
        const animate: typeof Reanimated.withTiming = (value, config, callback) => {
            if (callback) {
                completions.push(callback);
            }
            return value;
        };
        jest.spyOn(Reanimated, 'withTiming').mockImplementation(animate);
        const dashboardChart = (isLoading: boolean) => <ChartCaptureContext.Provider value={{isCapturing: false, reportLoading}}>{renderChart(isLoading)}</ChartCaptureContext.Provider>;
        const {rerender} = render(dashboardChart(true));

        // When data loads and the held frames have passed, but the fade is still running
        rerender(dashboardChart(false));
        runFrames(HOLD_FRAMES);

        // Then export remains disabled instead of capturing a translucent chart
        expect(reportLoading.mock.calls.at(-1)?.at(1)).toBe(true);

        // When the fade completes
        act(() => {
            for (const complete of completions) {
                complete(true);
            }
        });
        flushWorklets();

        // Then the chart permits capture
        expect(reportLoading.mock.calls.at(-1)?.at(1)).toBe(false);
    });
});
