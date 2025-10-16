import RenderTaskQueue from '../../src/components/InvertedFlatList/BaseInvertedFlatList/RenderTaskQueue';

describe('RenderTaskQueue', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    describe('notifyRenderingStateChange callback', () => {
        it('should call callback with true when rendering starts', () => {
            const mockCallback = jest.fn();
            const queue = new RenderTaskQueue(mockCallback);

            queue.add({distanceFromStart: 100});

            expect(mockCallback).toHaveBeenCalledWith(true);
            expect(mockCallback).toHaveBeenCalledTimes(1);
        });

        it('should call callback with false when rendering finishes', () => {
            const mockCallback = jest.fn();
            const queue = new RenderTaskQueue(mockCallback);

            queue.add({distanceFromStart: 100});

            expect(mockCallback).toHaveBeenCalledWith(true);
            jest.advanceTimersByTime(500);
            expect(mockCallback).toHaveBeenCalledTimes(2);
            expect(mockCallback).toHaveBeenCalledWith(false);
        });
    });
});
