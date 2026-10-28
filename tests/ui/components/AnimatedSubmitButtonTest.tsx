/* eslint-disable testing-library/no-unnecessary-act -- DOM Testing Library's fireEvent does not wrap React DOM updates in act. */
import {fireEvent, screen} from '@testing-library/dom';

import AnimatedSubmitButton from '@components/AnimatedSubmitButton';

import CONST from '@src/CONST';

import type {View} from 'react-native';
import type * as Reanimated from 'react-native-reanimated';

import React, {act, useState} from 'react';
import {createRoot} from 'react-dom/client';
import Animated, {useReducedMotion} from 'react-native-reanimated';

// The shared Reanimated mock removes exiting views immediately, hiding this regression.
// Render the real web implementation so it retains exiting views just as the browser does.
jest.mock('react-native-reanimated', () => {
    const actual = jest.requireActual<typeof Reanimated>('react-native-reanimated/src');
    const WebView = actual.createAnimatedComponent(jest.requireActual<typeof View>('react-native-web/dist/cjs/exports/View'));
    return {
        ...actual,
        __esModule: true,
        default: {
            ...actual.default,
            View: jest.fn((props: React.ComponentProps<typeof WebView>) => <WebView {...props} />),
        },
        // Jest does not compile app worklets. Keep the real web hook with explicit dependencies.
        useAnimatedStyle: (updater: Parameters<typeof actual.useAnimatedStyle>[0]) => actual.useAnimatedStyle(updater, [updater]),
        useReducedMotion: jest.fn(() => false),
    };
});
jest.mock('react-native', () => jest.requireActual<Record<string, unknown>>('react-native-web'));
jest.mock('react-native-reanimated/src/common', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-native-reanimated/src/common'),
    IS_WEB: true,
    IS_IOS: false,
}));
jest.mock('react-native-reanimated/src/css/platform', () => jest.requireActual<Record<string, unknown>>('react-native-reanimated/src/css/platform.ts'));
jest.mock('react-native-reanimated/src/createAnimatedComponent/AnimatedComponent', () =>
    jest.requireActual<Record<string, unknown>>('react-native-reanimated/src/createAnimatedComponent/AnimatedComponent.tsx'),
);
jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined]));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({justifyContentCenter: {justifyContent: 'center'}})));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({Send: () => null}),
}));
jest.mock('@userActions/IOU/ReportWorkflow', () => ({
    clearPendingExpenseAction: jest.fn(),
}));
jest.mock('@components/Button', () => ({
    __esModule: true,
    default: Object.assign(
        ({children, isLoading, onPress}: {children: React.ReactNode; isLoading?: boolean; onPress?: () => void}) => (
            <button
                type="button"
                onClick={onPress}
            >
                {isLoading ? 'Submitting' : children}
            </button>
        ),
        {
            Text: ({children}: {children: React.ReactNode}) => children,
            Icon: () => null,
        },
    ),
}));

function CancellableSubmission({onAnimationFinish = () => undefined}: {onAnimationFinish?: () => void}) {
    const [isSubmitting, setIsSubmitting] = useState(true);

    return (
        <div>
            {isSubmitting ? (
                <AnimatedSubmitButton
                    text="Submit"
                    onPress={() => undefined}
                    isSubmittingAnimationRunning
                    onAnimationFinish={() => {
                        onAnimationFinish();
                        setIsSubmitting(false);
                    }}
                />
            ) : (
                <button type="button">Submit via PDF</button>
            )}
            <button
                type="button"
                onClick={() => setIsSubmitting(false)}
            >
                Cancel
            </button>
        </div>
    );
}

describe('AnimatedSubmitButton web animations', () => {
    let container: HTMLDivElement;
    let root: ReturnType<typeof createRoot>;

    beforeEach(() => {
        // The shared setup switches back to real timers; phase transitions in this suite must be deterministic.
        jest.useFakeTimers();
        jest.clearAllMocks();
        jest.mocked(useReducedMotion).mockReturnValue(false);
        // jsdom has no layout; the exit implementation needs an offset parent to retain its DOM clone.
        jest.spyOn(HTMLElement.prototype, 'offsetParent', 'get').mockImplementation(() => container);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => root.unmount());
        act(() => jest.runOnlyPendingTimers());
        container.remove();
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    it('removes the loading button immediately when cancellation replaces it with the submit dropdown', async () => {
        // Given an in-progress submission whose header switches back to the dropdown on cancellation
        act(() => root.render(<CancellableSubmission />));
        expect(screen.getByRole('button', {name: 'Submitting'})).toBeTruthy();

        // When the user cancels before PDF generation finishes
        await act(async () => fireEvent.click(screen.getByRole('button', {name: 'Cancel'})));

        // Then the old loading button must not remain beside the restored dropdown during an exit animation
        expect(screen.getByRole('button', {name: 'Submit via PDF'})).toBeTruthy();
        expect(screen.queryByRole('button', {name: 'Submitting'})).toBeNull();
        act(() => jest.advanceTimersByTime(CONST.ANIMATION_SUBMIT_DURATION));
        expect(screen.queryByRole('button', {name: 'Submitting'})).toBeNull();
    });

    it('does not finish an animation after cancellation during a slow submission', async () => {
        // Given a PDF that takes longer than the initial loading phase
        const onAnimationFinish = jest.fn();
        act(() => root.render(<CancellableSubmission onAnimationFinish={onAnimationFinish} />));
        await act(async () => jest.advanceTimersByTimeAsync(CONST.ANIMATION_SUBMIT_LOADING_STATE_DURATION));

        // When the modal is cancelled while PDF generation is still pending
        await act(async () => fireEvent.click(screen.getByRole('button', {name: 'Cancel'})));

        // Then neither the completed-looking button nor its finish callback can survive cancellation
        expect(screen.getByRole('button', {name: 'Submit via PDF'})).toBeTruthy();
        expect(screen.queryByRole('button', {name: 'Submitting'})).toBeNull();
        act(() => jest.runOnlyPendingTimers());
        expect(onAnimationFinish).not.toHaveBeenCalled();
    });

    it('also removes the loader when its animation is stopped without unmounting the component', async () => {
        // Given a caller that keeps the same AnimatedSubmitButton mounted when it stops submitting
        const props = {text: 'Submit', onPress: jest.fn(), onAnimationFinish: jest.fn()};
        act(() =>
            root.render(
                <AnimatedSubmitButton
                    {...props}
                    isSubmittingAnimationRunning
                />,
            ),
        );
        expect(screen.getByRole('button', {name: 'Submitting'})).toBeTruthy();

        // When the caller stops the animation instead of replacing the entire component
        await act(async () =>
            root.render(
                <AnimatedSubmitButton
                    {...props}
                    isSubmittingAnimationRunning={false}
                />,
            ),
        );

        // Then the enabled Submit button is the only submission button left in the DOM
        expect(screen.getByRole('button', {name: 'Submit'})).toBeTruthy();
        expect(screen.queryByRole('button', {name: 'Submitting'})).toBeNull();
    });

    it.each([false, true])('finishes a successful submission on its CSS completion callback (reduced motion: %s)', async (isReducedMotionEnabled) => {
        // Given a successful submission, including users who prefer no motion
        jest.mocked(useReducedMotion).mockReturnValue(isReducedMotionEnabled);
        const onAnimationFinish = jest.fn();
        await act(async () => root.render(<CancellableSubmission onAnimationFinish={onAnimationFinish} />));
        await act(async () => jest.advanceTimersByTimeAsync(CONST.ANIMATION_SUBMIT_LOADING_STATE_DURATION));
        expect(screen.getByRole('button', {name: 'common.submitted'})).toBeTruthy();

        // When the Submitted phase ends, CSS takes over; Jest does not run CSS animations, so inspect its configured callback
        await act(async () => jest.advanceTimersByTimeAsync(CONST.ANIMATION_SUBMIT_SUBMITTED_STATE_VISIBLE_DURATION));
        const animationProps = jest.mocked(Animated.View).mock.calls.findLast(([props]) => props.onCSSAnimationEnd)?.[0];
        const animationStyle: unknown = animationProps?.style;
        if (!animationStyle || typeof animationStyle !== 'object' || !('animationName' in animationStyle)) {
            throw new Error('Expected CSS animation styles on the submission button');
        }
        const animation = animationStyle.animationName;
        if (!animation || typeof animation !== 'object' || !('name' in animation) || typeof animation.name !== 'string') {
            throw new Error('Expected the submission CSS keyframes to be active');
        }
        const animationName = animation.name;
        expect(animationStyle).toHaveProperty('animationDuration', isReducedMotionEnabled ? 0 : CONST.ANIMATION_SUBMIT_DURATION);
        expect(animationStyle).toHaveProperty('animationFillMode', 'forwards');
        expect(animationProps?.onCSSAnimationCancel).toBeUndefined();
        expect(onAnimationFinish).not.toHaveBeenCalled();

        // Then unrelated animation events cannot finish the submission, but completing this animation does
        await act(async () => animationProps?.onCSSAnimationEnd?.({animationName: 'unrelated', elapsedTime: 0}));
        expect(onAnimationFinish).not.toHaveBeenCalled();
        await act(async () => {
            animationProps?.onCSSAnimationEnd?.({animationName, elapsedTime: isReducedMotionEnabled ? 0 : CONST.ANIMATION_SUBMIT_DURATION / 1000});
        });
        expect(onAnimationFinish).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole('button', {name: /^(Submitting|common\.submitted)$/})).toBeNull();
        expect(screen.getByRole('button', {name: 'Submit via PDF'})).toBeTruthy();
    });

    it('does not finish the submission when its CSS animation is cancelled by unmount', async () => {
        // Given the successful-submission fade has started, but the user can still cancel PDF generation
        const onAnimationFinish = jest.fn();
        await act(async () => root.render(<CancellableSubmission onAnimationFinish={onAnimationFinish} />));
        await act(async () => jest.advanceTimersByTimeAsync(CONST.ANIMATION_SUBMIT_LOADING_STATE_DURATION));
        await act(async () => jest.advanceTimersByTimeAsync(CONST.ANIMATION_SUBMIT_SUBMITTED_STATE_VISIBLE_DURATION));
        const animationProps = jest.mocked(Animated.View).mock.calls.findLast(([props]) => props.onCSSAnimationEnd)?.[0];
        expect(animationProps?.style).toHaveProperty('animationName.name', expect.any(String));

        // When the header replaces the animation, CSS cancels it instead of reporting successful completion
        await act(async () => fireEvent.click(screen.getByRole('button', {name: 'Cancel'})));
        act(() => jest.runOnlyPendingTimers());

        // Then cancellation removes the old button without running a successful-submission callback
        expect(animationProps?.onCSSAnimationCancel).toBeUndefined();
        expect(onAnimationFinish).not.toHaveBeenCalled();
        expect(screen.getByRole('button', {name: 'Submit via PDF'})).toBeTruthy();
        expect(screen.queryByRole('button', {name: /^(Submitting|common\.submitted)$/})).toBeNull();
    });
});
