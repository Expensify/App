import {act, renderHook} from '@testing-library/react-native';

import useRevealEditedInput from '@hooks/useRevealEditedInput';

import CONST from '@src/CONST';

import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';

import createMock from '../../utils/createMock';

function layout(height = 96): LayoutChangeEvent {
    return createMock<LayoutChangeEvent>({nativeEvent: {layout: {x: 0, y: 420, width: 300, height}}});
}

function scroll(offset: number, height = 300): NativeSyntheticEvent<NativeScrollEvent> {
    return createMock<NativeSyntheticEvent<NativeScrollEvent>>({nativeEvent: {contentOffset: {y: offset}, layoutMeasurement: {height}}});
}

describe('useRevealEditedInput', () => {
    let frameSpy: jest.SpiedFunction<typeof requestAnimationFrame>;
    let cancelSpy: jest.SpiedFunction<typeof cancelAnimationFrame>;

    beforeEach(() => {
        frameSpy = jest.spyOn(global, 'requestAnimationFrame').mockReturnValue(1);
        cancelSpy = jest.spyOn(global, 'cancelAnimationFrame').mockImplementation(() => {});
    });

    afterEach(() => {
        frameSpy.mockRestore();
        cancelSpy.mockRestore();
    });

    function setup(offset = 0, inputHeight = 96, viewportHeight = 300) {
        const scrollTo = jest.fn();
        const hook = renderHook(({isEnabled}) => useRevealEditedInput({isEnabled, scrollTo}), {initialProps: {isEnabled: true}});
        act(() => {
            hook.result.current.measureInput(layout(inputHeight));
            hook.result.current.trackScroll(scroll(offset, viewportHeight));
            hook.result.current.markFocused();
        });
        return {...hook, scrollTo};
    }

    function runFrame() {
        act(() => frameSpy.mock.calls.at(-1)?.[0](0));
    }

    it.each([
        [0, 96, 300, 216],
        [600, 96, 300, 420],
        [0, 600, 300, 420],
    ])('reveals the bounded input from offset %s with input height %s', (offset, inputHeight, viewportHeight, expected) => {
        // Given a focused input outside the viewport, including an input taller than that viewport
        const {result, scrollTo} = setup(offset, inputHeight, viewportHeight);

        // When several edits arrive before layout settles
        act(() => {
            result.current.revealEditedInput();
            result.current.revealEditedInput();
        });
        runFrame();

        // Then a single request reveals the box without taking over internal multiline caret scrolling
        expect(frameSpy).toHaveBeenCalledTimes(1);
        expect(scrollTo).toHaveBeenCalledTimes(1);
        expect(scrollTo).toHaveBeenCalledWith(expected);
    });

    it.each([
        [300, 96, 300],
        [0, 0, 300],
        [0, 96, 0],
    ])('does not scroll visible or unmeasured input (%s, %s, %s)', (offset, inputHeight, viewportHeight) => {
        // Given a visible input or incomplete layout measurements
        const {result, scrollTo} = setup(offset, inputHeight, viewportHeight);

        // When editing resumes
        act(() => result.current.revealEditedInput());
        runFrame();

        // Then no unnecessary or speculative scroll is requested
        expect(scrollTo).not.toHaveBeenCalled();
    });

    it('does not restart an animation on intermediate scroll events', () => {
        // Given an animated recovery toward offset 216
        const {result, scrollTo} = setup();
        act(() => result.current.revealEditedInput());
        runFrame();

        // When typing continues while the animation is partway to its target
        act(() => {
            result.current.trackScroll(scroll(100));
            result.current.revealEditedInput();
        });
        runFrame();

        // Then the existing animation is not restarted
        expect(scrollTo).toHaveBeenCalledTimes(1);
        expect(scrollTo).toHaveBeenCalledWith(216);
    });

    it('allows recovery after a manual drag interrupts an animation', () => {
        // Given an animation whose target has not yet been reached
        const {result, scrollTo} = setup();
        act(() => result.current.revealEditedInput());
        runFrame();

        // When a manual drag cancels recovery and the user subsequently edits again
        act(() => {
            result.current.cancelRecovery();
            result.current.trackScroll(scroll(0));
            result.current.revealEditedInput();
        });
        runFrame();

        // Then the input can be revealed again, even with the same target
        expect(scrollTo).toHaveBeenCalledTimes(2);
    });

    it('retries after an interrupted web animation even without a drag event', () => {
        // Given a browser scroll interrupted before reaching its target, without a native drag event
        const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(0);
        const {result, scrollTo} = setup();
        act(() => result.current.revealEditedInput());
        runFrame();
        act(() => result.current.trackScroll(scroll(100)));

        // When the duplicate-suppression window expires
        nowSpy.mockReturnValue(CONST.ANIMATED_TRANSITION + 1);

        // Then time alone does not scroll, but a subsequent edit can retry the same target
        expect(scrollTo).toHaveBeenCalledTimes(1);
        act(() => result.current.revealEditedInput());
        runFrame();
        expect(scrollTo).toHaveBeenCalledTimes(2);
        expect(scrollTo).toHaveBeenLastCalledWith(216);
        nowSpy.mockRestore();
    });

    it('uses the latest viewport before requesting a scroll', () => {
        // Given an edit scheduled while the input is obscured
        const {result, scrollTo} = setup();
        act(() => result.current.revealEditedInput());

        // When a scroll reveals it before the scheduled frame
        act(() => result.current.trackScroll(scroll(300)));
        runFrame();

        // Then recovery respects the new viewport
        expect(scrollTo).not.toHaveBeenCalled();
    });

    it.each(['blur', 'disable', 'unmount', 'submit'] as const)('cancels pending recovery on %s', (reason) => {
        // Given an off-screen edit queued for the next frame
        const {result, scrollTo, rerender, unmount} = setup();
        act(() => result.current.revealEditedInput());

        // When the input or consumer stops accepting recovery
        act(() => {
            if (reason === 'blur') {
                result.current.markBlurred();
            } else if (reason === 'disable') {
                rerender({isEnabled: false});
            } else if (reason === 'unmount') {
                unmount();
            } else {
                result.current.cancelRecovery();
            }
        });
        runFrame();

        // Then cancellation also makes a late callback harmless
        expect(cancelSpy).toHaveBeenCalledWith(1);
        expect(scrollTo).not.toHaveBeenCalled();
    });
});
