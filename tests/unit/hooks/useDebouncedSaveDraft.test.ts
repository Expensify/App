import {act, renderHook} from '@testing-library/react-native';

import useDebouncedSaveDraft from '@pages/inbox/report/useDebouncedSaveDraft';

describe('useDebouncedSaveDraft', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('invokes saveDraftFn on the trailing edge when not cancelled', () => {
        const saveDraftFn = jest.fn();
        const wait = 1000;

        const {result} = renderHook(() => useDebouncedSaveDraft(saveDraftFn, wait));

        act(() => {
            result.current.saveDraft('edited message');
        });

        expect(saveDraftFn).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(wait);
        });

        expect(saveDraftFn).toHaveBeenCalledTimes(1);
        expect(saveDraftFn).toHaveBeenCalledWith('edited message');
    });

    // Regression test for https://github.com/Expensify/App/issues/98580: a debounced report-action draft save
    // that outlives its edit session (Save/Cancel already cleared the draft) must not resurrect it a moment later.
    it('does not invoke saveDraftFn when cancelSaveDraft is called before the debounce fires', () => {
        const saveDraftFn = jest.fn();
        const wait = 1000;

        const {result} = renderHook(() => useDebouncedSaveDraft(saveDraftFn, wait));

        act(() => {
            result.current.saveDraft('edited message');
        });

        // Simulate Save/Cancel ending the edit session before the debounced write has a chance to land.
        act(() => {
            result.current.cancelSaveDraft();
        });

        act(() => {
            jest.advanceTimersByTime(wait);
        });

        expect(saveDraftFn).not.toHaveBeenCalled();
    });

    it('still saves a later call scheduled after a cancellation', () => {
        const saveDraftFn = jest.fn();
        const wait = 1000;

        const {result} = renderHook(() => useDebouncedSaveDraft(saveDraftFn, wait));

        act(() => {
            result.current.saveDraft('first edit, will be cancelled');
        });

        act(() => {
            result.current.cancelSaveDraft();
        });

        // A brand-new edit session starts a new save, which should behave normally.
        act(() => {
            result.current.saveDraft('second edit, should be saved');
        });

        act(() => {
            jest.advanceTimersByTime(wait);
        });

        expect(saveDraftFn).toHaveBeenCalledTimes(1);
        expect(saveDraftFn).toHaveBeenCalledWith('second edit, should be saved');
    });

    it('cancelSaveDraft is a no-op when no save is pending', () => {
        const saveDraftFn = jest.fn();
        const wait = 1000;

        const {result} = renderHook(() => useDebouncedSaveDraft(saveDraftFn, wait));

        expect(() => {
            act(() => {
                result.current.cancelSaveDraft();
            });
        }).not.toThrow();

        act(() => {
            jest.advanceTimersByTime(wait);
        });

        expect(saveDraftFn).not.toHaveBeenCalled();
    });
});
