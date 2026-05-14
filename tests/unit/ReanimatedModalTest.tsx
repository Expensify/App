/**
 * Unit tests for ReanimatedModal's transition state machine.
 *
 * These tests guard against regressions introduced by incorrect isTransitioning
 * derivation (isVisible !== isContainerOpen). The derived approach fails when
 * isVisible oscillates back to match isContainerOpen mid-animation, causing
 * premature handle cleanup and broken animations.
 *
 * Related staging regressions:
 *   - https://github.com/Expensify/App/issues/90438  (RHP does not animate)
 *   - https://github.com/Expensify/App/issues/90442  (Unable to delete on Android)
 *   - https://github.com/Expensify/App/issues/90463  (Modal not displayed on Android)
 *   - https://github.com/Expensify/App/issues/90510  (Web flickering on close)
 */
import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {InteractionManager} from 'react-native';
import ReanimatedModal from '@components/Modal/ReanimatedModal';
// eslint-disable-next-line no-restricted-imports
import TransitionTracker from '@libs/Navigation/TransitionTracker';

// ---------------------------------------------------------------------------
// Container mock
//
// Reanimated's Keyframe.withCallback() is a no-op in the test environment,
// so onOpenCallBack / onCloseCallBack are never called by animations.
// This mock captures the latest callback so tests can trigger it manually
// to simulate animation completion.
//
// The mock also uses useAnimationTransition to mirror real Container behavior:
// handles are created/ended in the same lifecycle as the real component, so
// tests can spy on TransitionTracker and InteractionManager at this level.
// ---------------------------------------------------------------------------
let capturedOnOpenCallBack: (() => void) | undefined;

jest.mock('@components/Modal/ReanimatedModal/Container', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    const {default: useAnimationTransition} = require('@hooks/useAnimationTransition') as {
        default: () => {onAnimationComplete: () => void};
    };
    // Hooks can assign to external variables (RC only restricts this in components).
    // We use a hook to wire the captured callback, keeping MockContainer RC-compliant.
    function useCaptureOpenCallback(onOpenCallBack: () => void, onAnimationComplete: () => void) {
        capturedOnOpenCallBack = () => {
            onOpenCallBack();
            onAnimationComplete();
        };
    }

    function MockContainer({onOpenCallBack, onCloseCallBack: _onCloseCallBack, children, ...rest}: Record<string, unknown>) {
        const {onAnimationComplete} = useAnimationTransition();

        // Wire the captured callback to also fire onAnimationComplete, matching
        // real Container behavior where both callbacks fire at animation end.
        useCaptureOpenCallback(onOpenCallBack as () => void, onAnimationComplete);

        return (
            <View
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
                testID="mock-modal-container"
            >
                {children as React.ReactNode}
            </View>
        );
    }
    return MockContainer;
});

jest.mock('@components/Modal/ReanimatedModal/Backdrop', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    function MockBackdrop({children}: {children?: React.ReactNode}) {
        return <View testID="mock-backdrop">{children}</View>;
    }
    return MockBackdrop;
});

jest.mock('@components/FocusTrap/FocusTrapForModal', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    function MockFocusTrap({children}: {children?: React.ReactNode}) {
        return <View>{children}</View>;
    }
    return MockFocusTrap;
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
    let createHandleSpy: jest.SpyInstance;
    let clearHandleSpy: jest.SpyInstance;

    beforeEach(() => {
        capturedOnOpenCallBack = undefined;
        startTransitionSpy = jest.spyOn(TransitionTracker, 'startTransition');
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

    // -----------------------------------------------------------------------
    // Oscillation tests — guard for https://github.com/Expensify/App/issues/90438
    // -----------------------------------------------------------------------

    describe('transition handles during isVisible oscillation', () => {
        /**
         * Regression guard for https://github.com/Expensify/App/issues/90438
         *
         * When isVisible briefly flips false → true while the closing animation is
         * still running (modalState is still 'closing'), the transition should remain
         * active.  The derived-value bug ends the transition prematurely because
         * isTransitioning = isVisible !== isContainerOpen = true !== true = false,
         * which triggers the handles effect's cleanup.
         */
        it('does not end an active transition when isVisible oscillates during a closing animation', async () => {
            const afterTransitionsCallback = jest.fn();
            const {rerender, unmount} = render(<ReanimatedModal isVisible={false} />);

            // 1. Open the modal and complete the entering animation.
            rerender(<ReanimatedModal isVisible />);
            expect(startTransitionSpy).toHaveBeenCalledTimes(1);
            completeOpenAnimation();
            // modalState is now 'open'; transition handles cleared.

            // 2. Begin closing.
            rerender(<ReanimatedModal isVisible={false} />);
            expect(startTransitionSpy).toHaveBeenCalledTimes(2);
            // Closing animation is in progress — onCloseCallBack has NOT fired yet.

            // 3. isVisible oscillates back to true before the exit animation finishes.
            //    This simulates a prop change mid-animation, e.g. from rapid RHP navigation.
            rerender(<ReanimatedModal isVisible />);
            // modalState is still 'closing' (derived-value bug would compute isTransitioning=false here).
            // With the bug: isTransitioning = true !== true = false → the handles effect cleanup
            // fires → endTransition called prematurely.

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
         * not be cleared until onCloseCallBack fires.
         *
         * Note: InteractionManager.runAfterInteractions is mocked to fire immediately
         * in tests (regardless of active handles), so we guard this regression by
         * asserting that clearInteractionHandle is NOT called an extra time during
         * oscillation — meaning the closing-phase handle remains active.
         */
        it('does not clear the interaction handle prematurely when isVisible oscillates during a closing animation', async () => {
            const {rerender, unmount} = render(<ReanimatedModal isVisible={false} />);

            // 1. Open and complete the entering animation.
            rerender(<ReanimatedModal isVisible />);
            completeOpenAnimation();
            // Opening-phase handle cleared by onOpenCallBack.
            const clearCountAfterOpen = clearHandleSpy.mock.calls.length;

            // 2. Begin closing.
            rerender(<ReanimatedModal isVisible={false} />);
            // Closing animation is in progress — a new interaction handle is now active.

            // 3. isVisible oscillates back before the exit animation finishes.
            rerender(<ReanimatedModal isVisible />);
            // ASSERTION: clearInteractionHandle must NOT have been called again.
            // The closing-phase handle should still be active.
            // With the bug: isTransitioning would derive to false → effect cleanup fires
            // → clearInteractionHandle called prematurely.
            expect(clearHandleSpy.mock.calls.length).toBe(clearCountAfterOpen);

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
         * When isVisible changes to false (closing begins), the Container unmounts from
         * React so that Reanimated can play the Exiting animation via its ghost-node
         * mechanism. If isVisible then oscillates back to true mid-animation, the
         * Container must NOT re-mount — re-mounting while the ghost-node exit animation
         * is playing causes a visual flash (the regression symptom).
         *
         * The fix: modalState stays 'closing' through isVisible oscillation.  The
         * Container condition `(modalState === 'opening' || modalState === 'open')` is
         * false throughout, so the Container stays unmounted until onCloseCallBack fires.
         */
        it('does not re-mount the Container when isVisible oscillates during a closing animation', async () => {
            const {rerender, unmount} = render(<ReanimatedModal isVisible={false} />);

            // 1. Open the modal and complete the entering animation.
            rerender(<ReanimatedModal isVisible />);
            completeOpenAnimation();
            // modalState is now 'open'. Container is mounted.
            expect(screen.getByTestId('mock-modal-container')).toBeOnTheScreen();

            // 2. Begin closing — Container unmounts to trigger its Exiting animation.
            rerender(<ReanimatedModal isVisible={false} />);
            // modalState transitions to 'closing'. Container unmounts (condition becomes false).
            // Reanimated ghost node keeps it visually alive for the animation.
            expect(screen.queryByTestId('mock-modal-container')).toBeNull();

            // 3. isVisible oscillates back to true.
            rerender(<ReanimatedModal isVisible />);
            // ASSERTION: Container must NOT re-mount — modalState stays 'closing'.
            // With the bug (derived isTransitioning or {isVisible && containerView}),
            // the Container would re-mount here, clashing with the ghost-node animation.
            expect(screen.queryByTestId('mock-modal-container')).toBeNull();

            unmount();
        });
    });

    // -----------------------------------------------------------------------
    // Baseline: handle lifecycle in a normal open → close cycle
    //
    // This test documents the CORRECT lifecycle: handles are cleared when the
    // animation callback fires, not prematurely.
    // -----------------------------------------------------------------------

    describe('interaction handle lifecycle', () => {
        it('clears the interaction handle exactly when the opening animation callback fires', async () => {
            const {rerender, unmount} = render(<ReanimatedModal isVisible={false} />);

            rerender(<ReanimatedModal isVisible />);

            // One handle should have been created for the opening animation.
            expect(createHandleSpy).toHaveBeenCalledTimes(1);

            // Capture how many times clearInteractionHandle has been called so far.
            // The exact count may vary due to effect cleanup runs (e.g., transitioning
            // from 'closed' with no active handle = no-op), but what matters is that
            // the count does NOT increase again until the animation callback fires.
            const clearCountBeforeAnimation = clearHandleSpy.mock.calls.length;

            completeOpenAnimation();

            // ASSERTION: clearInteractionHandle must have been called at least once more
            // after the animation completes — the opening-phase handle must be released
            // exactly when onOpenCallBack fires, not before.
            expect(clearHandleSpy.mock.calls.length).toBeGreaterThan(clearCountBeforeAnimation);

            unmount();
        });
    });
});
