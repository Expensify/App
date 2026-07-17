import {renderHook} from '@testing-library/react-native';

import useMFACancelOnEscape from '@components/MultifactorAuthentication/useMFACancelOnEscape';

const mockRequestCancel = jest.fn();

jest.mock('@components/MultifactorAuthentication/Context', () => ({
    useMultifactorAuthentication: () => ({requestCancel: mockRequestCancel}),
}));

function dispatchKeyup(key: string): jest.SpyInstance {
    const event = new KeyboardEvent('keyup', {key, cancelable: true, bubbles: true});
    const stopImmediatePropagationSpy = jest.spyOn(event, 'stopImmediatePropagation');
    document.dispatchEvent(event);
    return stopImmediatePropagationSpy;
}

describe('useMFACancelOnEscape', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns false so the focus trap stays active', () => {
        // Given the hook is rendered
        // When the returned handler is invoked
        // Then it returns false so focus-trap does not deactivate
        const {result} = renderHook(() => useMFACancelOnEscape());

        expect(result.current()).toBe(false);
    });

    it('invokes requestCancel so the cancel-confirmation modal opens', () => {
        // Given the hook is rendered
        // When the returned handler is invoked
        // Then requestCancel runs, which dispatches SET_CANCEL_CONFIRM_VISIBLE: true
        const {result} = renderHook(() => useMFACancelOnEscape());

        result.current();

        expect(mockRequestCancel).toHaveBeenCalledTimes(1);
    });

    it('suppresses the matching ESC keyup so the modal does not close immediately', () => {
        // Given the focus-trap escape handler has just run on keydown
        // When the matching ESC keyup arrives moments later
        // Then propagation is stopped so the modal's keyup listener cannot fire
        const {result} = renderHook(() => useMFACancelOnEscape());

        result.current();
        const stopImmediatePropagationSpy = dispatchKeyup('Escape');

        expect(stopImmediatePropagationSpy).toHaveBeenCalledTimes(1);
    });

    it('does not stop propagation for a non-ESC keyup that races in', () => {
        // Given another key is released between the focus-trap keydown and the ESC keyup
        // When that keyup fires first
        // Then we let it propagate normally — only ESC is special
        const {result} = renderHook(() => useMFACancelOnEscape());

        result.current();
        const stopImmediatePropagationSpy = dispatchKeyup('Enter');

        expect(stopImmediatePropagationSpy).not.toHaveBeenCalled();
    });

    it('self-removes after one keyup so subsequent ESC presses are not silently swallowed', () => {
        // Given the suppressor consumed its one keyup
        // When a later, unrelated ESC keyup happens
        // Then the suppressor is gone and propagation continues normally
        const {result} = renderHook(() => useMFACancelOnEscape());

        result.current();
        dispatchKeyup('Escape');
        const stopImmediatePropagationSpy = dispatchKeyup('Escape');

        expect(stopImmediatePropagationSpy).not.toHaveBeenCalled();
    });

    it('self-removes even when the first keyup is not ESC', () => {
        // Given a non-ESC key was released first (rare but possible with chorded keys)
        // When a later ESC keyup happens
        // Then the listener has already cleaned itself up
        const {result} = renderHook(() => useMFACancelOnEscape());

        result.current();
        dispatchKeyup('Enter');
        const stopImmediatePropagationSpy = dispatchKeyup('Escape');

        expect(stopImmediatePropagationSpy).not.toHaveBeenCalled();
    });
});
