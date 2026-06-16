import {renderHook} from '@testing-library/react-native';
import useStableIndexedHandler from '@hooks/useStableIndexedHandler';

describe('useStableIndexedHandler', () => {
    it('returns the same handler reference for the same index across renders', () => {
        const handler = jest.fn();
        const {result, rerender} = renderHook(({fn}: {fn: typeof handler}) => useStableIndexedHandler(fn), {initialProps: {fn: handler}});

        const onFocusAt0 = result.current(0);
        rerender({fn: handler});
        const onFocusAt0AfterRerender = result.current(0);

        expect(onFocusAt0AfterRerender).toBe(onFocusAt0);
    });

    it('returns different handler references for different indices', () => {
        const handler = jest.fn();
        const {result} = renderHook(({fn}: {fn: typeof handler}) => useStableIndexedHandler(fn), {initialProps: {fn: handler}});

        const onFocusAt0 = result.current(0);
        const onFocusAt1 = result.current(1);

        expect(onFocusAt0).not.toBe(onFocusAt1);
    });

    it('invokes the underlying handler with (index, ...args) when the cached handler is called', () => {
        const handler = jest.fn();
        const {result} = renderHook(({fn}: {fn: typeof handler}) => useStableIndexedHandler<[string, number]>(fn), {initialProps: {fn: handler}});

        const onFocusAt3 = result.current(3);
        onFocusAt3('hello', 42);

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(3, 'hello', 42);
    });

    it('cached bindings capture the handler at creation time (documented contract: caller must pass a stable handler)', () => {
        const firstHandler = jest.fn();
        const secondHandler = jest.fn();
        const {result, rerender} = renderHook(({fn}: {fn: jest.Mock}) => useStableIndexedHandler(fn), {initialProps: {fn: firstHandler}});

        const onFocusAt0CreatedWithFirst = result.current(0);

        rerender({fn: secondHandler});
        onFocusAt0CreatedWithFirst();

        // The cached binding was created when `firstHandler` was the input, so it calls `firstHandler`.
        // This is why the contract requires callers to pass a stable handler reference.
        expect(firstHandler).toHaveBeenCalledTimes(1);
        expect(firstHandler).toHaveBeenCalledWith(0);
        expect(secondHandler).not.toHaveBeenCalled();
    });

    it('binds new indices to the latest handler when the input function changes between renders', () => {
        const firstHandler = jest.fn();
        const secondHandler = jest.fn();
        const {result, rerender} = renderHook(({fn}: {fn: jest.Mock}) => useStableIndexedHandler(fn), {initialProps: {fn: firstHandler}});

        rerender({fn: secondHandler});
        // Index 5 was not visited under firstHandler, so its binding is created now and uses secondHandler.
        const onFocusAt5 = result.current(5);
        onFocusAt5();

        expect(firstHandler).not.toHaveBeenCalled();
        expect(secondHandler).toHaveBeenCalledTimes(1);
        expect(secondHandler).toHaveBeenCalledWith(5);
    });

    it('accumulates handlers for multiple indices and keeps each stable', () => {
        const handler = jest.fn();
        const {result, rerender} = renderHook(({fn}: {fn: typeof handler}) => useStableIndexedHandler(fn), {initialProps: {fn: handler}});

        const visited = [0, 1, 2, 3, 4].map((index) => result.current(index));
        rerender({fn: handler});
        const visitedAfterRerender = [0, 1, 2, 3, 4].map((index) => result.current(index));

        for (const [index, handlerForIndex] of visited.entries()) {
            expect(visitedAfterRerender.at(index)).toBe(handlerForIndex);
        }
    });

    it('returns the same handler for the same index even when called many times in one render', () => {
        const handler = jest.fn();
        const {result} = renderHook(({fn}: {fn: typeof handler}) => useStableIndexedHandler(fn), {initialProps: {fn: handler}});

        const first = result.current(7);
        const second = result.current(7);
        const third = result.current(7);

        expect(second).toBe(first);
        expect(third).toBe(first);
    });

    it('forwards the receiver-provided index, not the caller-provided one', () => {
        const handler = jest.fn();
        const {result} = renderHook(({fn}: {fn: typeof handler}) => useStableIndexedHandler<[]>(fn), {initialProps: {fn: handler}});

        // Bound to index 2; calling it must always pass 2 to the underlying handler.
        const onFocusAt2 = result.current(2);
        onFocusAt2();
        onFocusAt2();

        expect(handler).toHaveBeenNthCalledWith(1, 2);
        expect(handler).toHaveBeenNthCalledWith(2, 2);
    });
});
