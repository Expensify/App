/**
 * Unit tests for ReanimatedModal's transition state machine.
 *
 * These tests guard against regressions introduced when isTransitioning was
 * converted from explicit state to a derived value (isVisible !== isContainerOpen).
 * The derived approach fails when isVisible oscillates back to match isContainerOpen
 * mid-animation, causing premature handle cleanup and broken animations.
 *
 * Related staging regressions:
 *   - https://github.com/Expensify/App/issues/90438  (RHP does not animate)
 *   - https://github.com/Expensify/App/issues/90442  (Unable to delete on Android)
 *   - https://github.com/Expensify/App/issues/90463  (Modal not displayed on Android)
 *   - https://github.com/Expensify/App/issues/90510  (Web flickering on close)
 */
import {act, render} from '@testing-library/react-native';
import React from 'react';
import {InteractionManager} from 'react-native';
import ReanimatedModal from '@components/Modal/ReanimatedModal';
// eslint-disable-next-line no-restricted-imports
import TransitionTracker from '@libs/Navigation/TransitionTracker';

// ---------------------------------------------------------------------------
// Container mock
//
// Reanimated's Keyframe.withCallback() is a no-op in the test environment,
// so onOpenCallBack / onCloseCallBack are never called by animations.
// This mock captures the latest callbacks so tests can trigger them manually
// to simulate animation completion.
// ---------------------------------------------------------------------------
let capturedOnOpenCallBack: (() => void) | undefined;
let capturedOnCloseCallBack: (() => void) | undefined;

jest.mock('@components/Modal/ReanimatedModal/Container', () => {
    const {View} = require('react-native');
    return function MockContainer({onOpenCallBack, onCloseCallBack, children, ...rest}: Record<string, unknown>) {
        capturedOnOpenCallBack = onOpenCallBack as () => void;
        capturedOnCloseCallBack = onCloseCallBack as () => void;
        return (
            <View
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
                testID="mock-modal-container"
            >
                {children as React.ReactNode}
            </View>
        );
    };
});

jest.mock('@components/Modal/ReanimatedModal/Backdrop', () => {
    const {View} = require('react-native');
    return function MockBackdrop({children}: {children?: React.ReactNode}) {
        return <View testID="mock-backdrop">{children}</View>;
    };
});

jest.mock('@components/FocusTrap/FocusTrapForModal', () => {
    const {View} = require('react-native');
    return function MockFocusTrap({children}: {children?: React.ReactNode}) {
        return <View>{children}</View>;
    };
});

jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useWindowDimensions', () => () => ({windowWidth: 375, windowHeight: 667}));
jest.mock('@libs/Accessibility/blurActiveElement', () => jest.fn());

// Use a non-web platform so the back handler path is exercised and
// platform-specific branches stay consistent across tests.
jest.mock('@libs/getPlatform', () => jest.fn(() => 'ios'));

// ---------------------------------------------------------------------------

describe('ReanimatedModal', () => {
    let startTransitionSpy: jest.SpyInstance;
    let endTransitionSpy: jest.SpyInstance;
    let createHandleSpy: jest.SpyInstance;
    let clearHandleSpy: jest.SpyInstance;

    beforeEach(() => {
        capturedOnOpenCallBack = undefined;
        capturedOnCloseCallBack = undefined;
        startTransitionSpy = jest.spyOn(TransitionTracker, 'startTransition');
        endTransitionSpy = jest.spyOn(TransitionTracker, 'endTransition');
        createHandleSpy = jest.spyOn(InteractionManager, 'createInteractionHandle');
        clearHandleSpy = jest.spyOn(InteractionManager, 'clearInteractionHandle');
    });

    afterEach(() => {
        // Drain any open transitions so TransitionTracker's internal counter
        // is clean for the next test.
        jest.runAllTimers();
        jest.clearAllMocks();
    });

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    /** Simulates the opening animation completing. */
    function completeOpenAnimation() {
        act(() => {
            capturedOnOpenCallBack?.();
        });
    }

    /** Simulates the closing animation completing. */
    function completeCloseAnimation() {
        act(() => {
            capturedOnCloseCallBack?.();
        });
    }

    // -----------------------------------------------------------------------
    // Oscillation tests — guard for https://github.com/Expensify/App/issues/90438
    // -----------------------------------------------------------------------

    describe('transition handles during isVisible oscillation', () => {
        /**
         * Regression guard for https://github.com/Expensify/App/issues/90438
         *
         * When isVisible briefly flips false → true while the closing animation is
         * still running (isContainerOpen is still true), the transition should remain
         * active.  The derived-value bug ends the transition prematurely because
         * isTransitioning = isVisible !== isContainerOpen = true !== true = false,
         * which triggers the handles effect's cleanup.
         */
        it('does not end an active transition when isVisible oscillates during a closing animation', async () => {
            const afterTransitionsCallback = jest.fn();
            const {rerender, unmount} = render(<ReanimatedModal isVisible={false} />);

            // 1. Open the modal and complete the entering animation.
            await act(async () => {
                rerender(<ReanimatedModal isVisible={true} />);
            });
            expect(startTransitionSpy).toHaveBeenCalledTimes(1);
            completeOpenAnimation();
            // isContainerOpen is now true; transition handles cleared.

            // 2. Begin closing.
            await act(async () => {
                rerender(<ReanimatedModal isVisible={false} />);
            });
            expect(startTransitionSpy).toHaveBeenCalledTimes(2);
            // Closing animation is in progress — onCloseCallBack has NOT fired yet.

            // 3. isVisible oscillates back to true before the exit animation finishes.
            //    This simulates a prop change mid-animation, e.g. from rapid RHP navigation.
            await act(async () => {
                rerender(<ReanimatedModal isVisible={true} />);
            });
            // isContainerOpen is still true (close animation not complete).
            // With the derived-value bug: isTransitioning = true !== true = false
            //   → the handles effect cleanup fires → endTransition called prematurely.

            // 4. Queue a callback that should run only after all transitions end.
            TransitionTracker.runAfterTransitions({callback: afterTransitionsCallback});
            await jest.runAllTimersAsync();

            // ASSERTION: The closing transition is still in progress, so the callback
            // should NOT have fired yet.  With the bug, endTransition was called in step 3,
            // leaving no active transition, so the callback fires immediately.
            expect(afterTransitionsCallback).not.toHaveBeenCalled();

            unmount();
        });

        /**
         * Regression guard for https://github.com/Expensify/App/issues/90442
         *                    and https://github.com/Expensify/App/issues/90463
         *
         * The interaction handle created at the start of the closing animation must
         * not be cleared until onCloseCallBack fires.  If it is cleared early,
         * InteractionManager.runAfterInteractions tasks (e.g. showing a confirmation
         * dialog, focusing a text input) can fire while the animation is still playing.
         */
        it('does not clear the interaction handle prematurely when isVisible oscillates during a closing animation', async () => {
            const afterInteractionsCallback = jest.fn();
            const {rerender, unmount} = render(<ReanimatedModal isVisible={false} />);

            // 1. Open and complete the entering animation.
            await act(async () => {
                rerender(<ReanimatedModal isVisible={true} />);
            });
            completeOpenAnimation();

            // 2. Begin closing.
            await act(async () => {
                rerender(<ReanimatedModal isVisible={false} />);
            });
            // Closing animation is in progress — an interaction handle is now active.

            // 3. isVisible oscillates back before the exit animation finishes.
            await act(async () => {
                rerender(<ReanimatedModal isVisible={true} />);
            });
            // With the derived-value bug: isTransitioning = false → effect cleanup fires
            // → clearInteractionHandle called prematurely.

            // 4. Queue work that should wait until all animations are done.
            InteractionManager.runAfterInteractions(afterInteractionsCallback);
            await jest.runAllTimersAsync();

            // ASSERTION: The handle from the closing animation should still be active,
            // blocking runAfterInteractions from firing.  With the bug, the handle was
            // already cleared in step 3, so the callback fires immediately.
            expect(afterInteractionsCallback).not.toHaveBeenCalled();

            unmount();
        });
    });

    // -----------------------------------------------------------------------
    // Container visibility test — guard for https://github.com/Expensify/App/issues/90510
    // -----------------------------------------------------------------------

    describe('container visibility during animations', () => {
        /**
         * Regression guard for https://github.com/Expensify/App/issues/90510
         *
         * The Container must remain mounted while the exit animation is playing so
         * that the animation has a component to animate.  With {isVisible && containerView},
         * the Container is unmounted immediately when isVisible becomes false, before
         * onCloseCallBack fires.  The fix changes this to
         * {(isVisible || isTransitioning) && containerView}.
         */
        it('keeps the Container mounted during a closing animation so the exit animation can complete', async () => {
            const {rerender, getByTestId, unmount} = render(<ReanimatedModal isVisible={false} />);

            // 1. Open the modal and complete the entering animation.
            await act(async () => {
                rerender(<ReanimatedModal isVisible={true} />);
            });
            completeOpenAnimation();
            // isContainerOpen is now true.

            // 2. Begin closing — the exit animation should start playing.
            await act(async () => {
                rerender(<ReanimatedModal isVisible={false} />);
            });
            // isTransitioning is true (isContainerOpen=true, isVisible=false).
            // The Modal wrapper stays visible (modalVisibility = false || true = true).

            // ASSERTION: The Container must still be in the tree so Reanimated can
            // play the exit animation.  With the bug ({isVisible && containerView}),
            // the Container is unmounted immediately when isVisible becomes false.
            expect(getByTestId('mock-modal-container')).toBeOnTheScreen();

            // 3. Animation completes — now the Container should be removed.
            completeCloseAnimation();
            // isContainerOpen is now false; isTransitioning = false;
            // (isVisible || isTransitioning) = false — Container should unmount.

            // Verify the container is gone after the animation.
            expect(() => getByTestId('mock-modal-container')).toThrow();

            unmount();
        });
    });

    // -----------------------------------------------------------------------
    // Baseline: handle lifecycle in a normal open → close cycle
    //
    // This test documents the CORRECT lifecycle: one handle per transition phase,
    // cleared only when the animation callback fires — not before.
    // -----------------------------------------------------------------------

    describe('interaction handle lifecycle', () => {
        it('does not clear an interaction handle before the opening animation callback fires', async () => {
            const {rerender, unmount} = render(<ReanimatedModal isVisible={false} />);

            await act(async () => {
                rerender(<ReanimatedModal isVisible={true} />);
            });

            // One handle should be active for the opening animation.
            expect(createHandleSpy).toHaveBeenCalledTimes(1);
            // The handle must NOT be cleared yet — the animation is still playing.
            // With the bug, derived isTransitioning causes extra effect cleanup cycles that
            // release the handle before the animation callback fires.
            expect(clearHandleSpy).toHaveBeenCalledTimes(0);

            completeOpenAnimation();
            // Now that the animation is done, the handle should have been cleared.
            expect(clearHandleSpy).toHaveBeenCalledTimes(1);

            unmount();
        });
    });
});
