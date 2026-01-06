import RenderTaskQueue from '../../src/components/InvertedFlatList/RenderTaskQueue';

jest.unmock('../../src/components/InvertedFlatList/RenderTaskQueue');

describe('RenderTaskQueue', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    describe('notifyRenderingStateChange callback', () => {
        it('should notify rendering state changes when a task completes naturally to track the rendering lifecycle', () => {
            // Given a RenderTaskQueue with an isRendering change callback
            const mockOnIsRenderingChange = jest.fn();
            const queue = new RenderTaskQueue(mockOnIsRenderingChange);

            // When a task is added and allowed to complete
            queue.add({distanceFromStart: 100});

            // Then the callback is invoked with true when rendering starts
            expect(mockOnIsRenderingChange).toHaveBeenCalledWith(true);
            jest.advanceTimersByTime(500);

            // Then the callback is invoked with false when rendering completes
            expect(mockOnIsRenderingChange).toHaveBeenCalledTimes(2);
            expect(mockOnIsRenderingChange).toHaveBeenCalledWith(false);
        });

        it('should notify rendering state changes when a task is canceled to ensure proper cleanup', () => {
            // Given a RenderTaskQueue with an isRendering change callback
            const mockOnIsRenderingChange = jest.fn();
            const queue = new RenderTaskQueue(mockOnIsRenderingChange);

            // When a task is added but canceled before completion
            queue.add({distanceFromStart: 100});
            queue.cancel();

            // Then the callback is invoked with true when rendering starts
            expect(mockOnIsRenderingChange).toHaveBeenCalledWith(true);
            jest.advanceTimersByTime(500);

            // Then the callback is invoked with false even after canceling to ensure proper cleanup
            expect(mockOnIsRenderingChange).toHaveBeenCalledTimes(2);
            expect(mockOnIsRenderingChange).toHaveBeenCalledWith(false);
        });
    });
});
