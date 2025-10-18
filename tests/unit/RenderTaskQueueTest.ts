import RenderTaskQueue from '../../src/components/InvertedFlatList/BaseInvertedFlatList/RenderTaskQueue';

jest.unmock('../../src/components/InvertedFlatList/BaseInvertedFlatList/RenderTaskQueue');

describe('RenderTaskQueue', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    describe('notifyRenderingStateChange callback', () => {
        it('should call notifyRenderingStateChange callback 2 times durning render process', () => {
            const mockStateChangeCallback = jest.fn();
            const queue = new RenderTaskQueue(mockStateChangeCallback);

            queue.add({distanceFromStart: 100});

            expect(mockStateChangeCallback).toHaveBeenCalledWith(true);
            jest.advanceTimersByTime(500);
            expect(mockStateChangeCallback).toHaveBeenCalledTimes(2);
            expect(mockStateChangeCallback).toHaveBeenCalledWith(false);
        });

        it('should call notifyRenderingStateChange callback 2 times when canceling render', () => {
            const mockCallback = jest.fn();
            const queue = new RenderTaskQueue(mockCallback);

            queue.add({distanceFromStart: 100});

            expect(mockCallback).toHaveBeenCalledWith(true);
            queue.cancel();
            jest.advanceTimersByTime(500);
            expect(mockCallback).toHaveBeenCalledTimes(2);
            expect(mockCallback).toHaveBeenCalledWith(false);
        });
    });
});
