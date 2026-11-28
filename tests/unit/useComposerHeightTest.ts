import {act, renderHook} from '@testing-library/react-native';

import useComposerHeight from '@pages/inbox/report/ReportActionCompose/useComposerHeight';

describe('useComposerHeight', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it.each(['a long draft that wraps without a newline', 'first\nsecond', '   ', '\n'])('does not cache the height of a restored draft: %j', (draft) => {
        // Given the composer mounts with text rather than a measured empty input.
        const {result} = renderHook(() => useComposerHeight());
        act(() => result.current.updateEmptyComposerHeight(56, draft));

        // When the restored draft is sent without editing.
        act(() => result.current.resetHeight());

        // Then no draft height constrains the empty composer.
        expect(result.current.composerHeightAfterClear).toBeNull();
    });

    it('keeps the first positive empty height for the clear render, then releases it without a size event', () => {
        // Given the input has measured its empty height before growing with a message.
        const {result} = renderHook(() => useComposerHeight());
        act(() => {
            result.current.updateEmptyComposerHeight(0, '');
            result.current.updateEmptyComposerHeight(36, '');
            result.current.updateEmptyComposerHeight(56, 'wrapped draft');
            result.current.updateEmptyComposerHeight(56, '');
        });

        // When sending applies the cached height for the render that clears the input.
        act(() => result.current.resetHeight());
        expect(result.current.composerHeightAfterClear).toBe(36);
        act(() => jest.runOnlyPendingTimers());

        // Then natural sizing resumes even if the input emits no content size change.
        expect(result.current.composerHeightAfterClear).toBeNull();
        act(() => result.current.resetHeight());
        expect(result.current.composerHeightAfterClear).toBe(36);
        act(() => jest.runOnlyPendingTimers());
        expect(result.current.composerHeightAfterClear).toBeNull();
    });

    it('can measure the empty input after a restored draft is cleared', () => {
        // Given mounting with a draft did not establish an empty height.
        const {result} = renderHook(() => useComposerHeight());
        act(() => result.current.updateEmptyComposerHeight(56, 'restored draft'));
        act(() => result.current.resetHeight());

        // When clearing produces the first genuinely empty measurement.
        act(() => result.current.updateEmptyComposerHeight(36, ''));
        act(() => result.current.resetHeight());

        // Then later sends use the empty measurement, not the restored draft height.
        expect(result.current.composerHeightAfterClear).toBe(36);
    });

    it('cancels the pending frame when typing clears the height and when unmounting', () => {
        // Given a measured empty composer is temporarily constrained during send.
        const cancelFrame = jest.spyOn(global, 'cancelAnimationFrame');
        const {result, unmount} = renderHook(() => useComposerHeight());
        act(() => result.current.updateEmptyComposerHeight(36, ''));
        act(() => result.current.resetHeight());

        // When typing clears the constraint before its frame, then another send precedes unmount.
        act(() => result.current.clearComposerHeight());
        expect(result.current.composerHeightAfterClear).toBeNull();
        expect(cancelFrame).toHaveBeenCalledTimes(1);
        act(() => result.current.resetHeight());
        unmount();

        // Then neither scheduled frame can update an obsolete composer.
        expect(cancelFrame).toHaveBeenCalledTimes(2);
        expect(jest.getTimerCount()).toBe(0);
    });
});
