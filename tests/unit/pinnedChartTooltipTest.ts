import {dismissPinnedChartTooltip, markChartTouch, pinChartTooltip, unpinChartTooltip} from '@components/Charts/utils/pinnedChartTooltip';

describe('pinnedChartTooltip', () => {
    beforeEach(() => {
        // The pinned tooltip lives in module state, so each test starts with nothing pinned and no chart touched
        dismissPinnedChartTooltip();
    });

    describe('pinChartTooltip', () => {
        it('hides the tooltip of another chart when a new one is pinned', () => {
            // Given a tooltip pinned on one chart
            const firstDismiss = jest.fn();
            const secondDismiss = jest.fn();
            pinChartTooltip(firstDismiss);

            // When a tooltip is pinned on another chart
            pinChartTooltip(secondDismiss);

            // Then only one tooltip stays visible on the screen
            expect(firstDismiss).toHaveBeenCalledTimes(1);
            expect(secondDismiss).not.toHaveBeenCalled();
        });

        it('keeps the tooltip visible when the same one is pinned again', () => {
            // Given a pinned tooltip
            const dismiss = jest.fn();
            pinChartTooltip(dismiss);

            // When it is pinned again, as happens when its chart re-renders
            pinChartTooltip(dismiss);

            // Then it is not hidden by its own re-registration
            expect(dismiss).not.toHaveBeenCalled();
        });
    });

    describe('unpinChartTooltip', () => {
        it('stops hiding a tooltip on screen touches once it is unpinned', () => {
            // Given a pinned tooltip that its chart already hid by itself
            const dismiss = jest.fn();
            pinChartTooltip(dismiss);
            unpinChartTooltip(dismiss);

            // When the screen is touched
            dismissPinnedChartTooltip();

            // Then the tooltip is not hidden a second time
            expect(dismiss).not.toHaveBeenCalled();
        });

        it('keeps the pinned tooltip when a tooltip that was replaced earlier is unpinned', () => {
            // Given a tooltip that was replaced by one pinned on another chart
            const firstDismiss = jest.fn();
            const secondDismiss = jest.fn();
            pinChartTooltip(firstDismiss);
            pinChartTooltip(secondDismiss);

            // When the replaced tooltip cleans up after itself
            unpinChartTooltip(firstDismiss);
            dismissPinnedChartTooltip();

            // Then the current tooltip is still registered and gets hidden by the screen touch
            expect(secondDismiss).toHaveBeenCalledTimes(1);
            expect(firstDismiss).toHaveBeenCalledTimes(1);
        });
    });

    describe('dismissPinnedChartTooltip', () => {
        it('hides the pinned tooltip on a touch outside of any chart', () => {
            // Given a pinned tooltip
            const dismiss = jest.fn();
            pinChartTooltip(dismiss);

            // When the screen is touched outside of any chart
            dismissPinnedChartTooltip();

            // Then the tooltip is hidden
            expect(dismiss).toHaveBeenCalledTimes(1);
        });

        it('keeps the pinned tooltip on a touch on its own chart', () => {
            // Given a pinned tooltip
            const dismiss = jest.fn();
            pinChartTooltip(dismiss);

            // When its own chart is touched, so the chart decides what happens with the tooltip
            markChartTouch(dismiss);
            dismissPinnedChartTooltip();

            // Then the screen touch does not hide it
            expect(dismiss).not.toHaveBeenCalled();
        });

        it('hides the pinned tooltip on a touch on another chart with a pinned tooltip', () => {
            // Given a pinned tooltip
            const dismiss = jest.fn();
            const otherDismiss = jest.fn();
            pinChartTooltip(dismiss);

            // When a chart other than the one showing the tooltip is touched
            markChartTouch(otherDismiss);
            dismissPinnedChartTooltip();

            // Then the tooltip is hidden
            expect(dismiss).toHaveBeenCalledTimes(1);
            expect(otherDismiss).not.toHaveBeenCalled();
        });

        it('hides the pinned tooltip on a touch on a chart with nothing pinned', () => {
            // Given a pinned tooltip
            const dismiss = jest.fn();
            pinChartTooltip(dismiss);

            // When a chart without a pinned tooltip is touched
            markChartTouch(undefined);
            dismissPinnedChartTooltip();

            // Then the tooltip is hidden
            expect(dismiss).toHaveBeenCalledTimes(1);
        });

        it('hides the pinned tooltip on a touch outside after a touch on its own chart', () => {
            // Given a pinned tooltip whose own chart was touched once
            const dismiss = jest.fn();
            pinChartTooltip(dismiss);
            markChartTouch(dismiss);
            dismissPinnedChartTooltip();

            // When the screen is touched outside of any chart
            dismissPinnedChartTooltip();

            // Then the touch on the chart only protected the tooltip from the touch it belonged to
            expect(dismiss).toHaveBeenCalledTimes(1);
        });

        it('hides the pinned tooltip only once', () => {
            // Given a pinned tooltip hidden by a screen touch
            const dismiss = jest.fn();
            pinChartTooltip(dismiss);
            dismissPinnedChartTooltip();

            // When the screen is touched again
            dismissPinnedChartTooltip();

            // Then the tooltip is not hidden again
            expect(dismiss).toHaveBeenCalledTimes(1);
        });

        it('does nothing on a touch when no tooltip is pinned', () => {
            // Given no pinned tooltip

            // When the screen is touched
            // Then nothing breaks
            expect(() => dismissPinnedChartTooltip()).not.toThrow();
        });
    });
});
