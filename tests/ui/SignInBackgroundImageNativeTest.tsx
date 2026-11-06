import {act, render, screen} from '@testing-library/react-native';

import {useSession} from '@components/OnyxListItemProvider';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {isAnonymousUser} from '@libs/actions/Session';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import BackgroundImage from '@pages/signin/SignInPageLayout/BackgroundImage/index.native';

import CONST from '@src/CONST';
import {useSplashScreenState} from '@src/SplashScreenStateContext';
import type {Session} from '@src/types/onyx';

import type {Image} from 'expo-image';
import type {ComponentProps} from 'react';
import type {ViewStyle} from 'react-native';
import type * as Reanimated from 'react-native-reanimated';

import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Easing, useSharedValue, withTiming} from 'react-native-reanimated';

import createMock from '../utils/createMock';

const mockRenderBackgroundImage = jest.fn<React.JSX.Element, [ComponentProps<typeof Image>]>(() => <View testID="native-sign-in-background" />);

// A positive registry ID models the native bundler's asset contract below the real component.
jest.mock('@assets/images/home-background--mobile.svg', () => 7);
jest.mock('@components/OnyxListItemProvider', () => ({useSession: jest.fn<ReturnType<typeof useSession>, Parameters<typeof useSession>>()}));
jest.mock('@hooks/useStyleUtils', () => jest.fn<ReturnType<typeof useStyleUtils>, Parameters<typeof useStyleUtils>>());
jest.mock('@hooks/useThemeStyles', () => jest.fn<ReturnType<typeof useThemeStyles>, Parameters<typeof useThemeStyles>>());
jest.mock('@libs/actions/Session', () => ({isAnonymousUser: jest.fn<ReturnType<typeof isAnonymousUser>, Parameters<typeof isAnonymousUser>>()}));
jest.mock('@libs/Navigation/TransitionTracker', () => ({
    runAfterTransitions: jest.fn<ReturnType<typeof TransitionTracker.runAfterTransitions>, Parameters<typeof TransitionTracker.runAfterTransitions>>(),
}));
jest.mock('@src/SplashScreenStateContext', () => ({
    useSplashScreenState: jest.fn<ReturnType<typeof useSplashScreenState>, Parameters<typeof useSplashScreenState>>(),
}));
jest.mock('expo-image', () => ({
    Image: (props: ComponentProps<typeof Image>) => mockRenderBackgroundImage(props),
}));
jest.mock('react-native-reanimated', () => {
    const reanimatedMock = jest.requireActual<typeof Reanimated>('react-native-reanimated/mock');
    return {
        ...reanimatedMock,
        useSharedValue: jest.fn(reanimatedMock.useSharedValue),
        withTiming: jest.fn(reanimatedMock.withTiming),
    };
});

const cancelBackgroundTransition = jest.fn<
    ReturnType<ReturnType<typeof TransitionTracker.runAfterTransitions>['cancel']>,
    Parameters<ReturnType<typeof TransitionTracker.runAfterTransitions>['cancel']>
>();
// Conflicting base values make reversed style order observable for width and opacity.
const backgroundBaseStyle = {position: 'absolute', width: 999, opacity: 0.5} satisfies ViewStyle;
const backgroundStyles = createMock<ReturnType<typeof useThemeStyles>>({signInBackground: backgroundBaseStyle});
// Only numeric native widths are exercised here. The shared utility itself is outside this test.
const backgroundStyleUtils = createMock<ReturnType<typeof useStyleUtils>>({
    getWidthStyle: jest.fn<ReturnType<ReturnType<typeof useStyleUtils>['getWidthStyle']>, Parameters<ReturnType<typeof useStyleUtils>['getWidthStyle']>>((width) => {
        if (typeof width !== 'number') {
            throw new Error('Expected a numeric native background width');
        }
        return {width};
    }),
});

const anonymousSession = createMock<Session>({authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS});
const signedInSession = createMock<Session>({authToken: 'signed-in'});

describe('native sign-in background', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useThemeStyles).mockReturnValue(backgroundStyles);
        jest.mocked(useStyleUtils).mockReturnValue(backgroundStyleUtils);
        jest.mocked(useSession).mockReturnValue(anonymousSession);
        jest.mocked(isAnonymousUser).mockReturnValue(true);
        jest.mocked(useSplashScreenState).mockReturnValue({splashScreenState: CONST.BOOT_SPLASH_STATE.HIDDEN});
        jest.mocked(TransitionTracker.runAfterTransitions).mockReturnValue({cancel: cancelBackgroundTransition});
    });

    it('keeps an anonymous background hidden until the selected transition callback completes', () => {
        // Given the splash is already hidden, transition completion must still protect anonymous mounting.
        const background = render(<BackgroundImage width={320} />);
        expect(background.toJSON()).toBeNull();
        expect(mockRenderBackgroundImage).not.toHaveBeenCalled();
        expect(isAnonymousUser).toHaveBeenCalledWith(anonymousSession);
        expect(TransitionTracker.runAfterTransitions).toHaveBeenCalledTimes(1);
        const transition = jest.mocked(TransitionTracker.runAfterTransitions).mock.calls.at(0)?.[0];
        if (!transition) {
            throw new Error('Expected the anonymous background transition');
        }

        // When ordinary rerenders occur before the queued callback, they must not complete or reschedule it.
        background.rerender(<BackgroundImage width={640} />);
        expect(background.toJSON()).toBeNull();
        expect(TransitionTracker.runAfterTransitions).toHaveBeenCalledTimes(1);
        act(() => {
            transition.callback();
        });

        // Then the real native component mounts its image only after that callback, without starting a fade yet.
        expect(screen.getByTestId('native-sign-in-background')).toBeTruthy();
        expect(withTiming).not.toHaveBeenCalled();
        expect(cancelBackgroundTransition).not.toHaveBeenCalled();
        background.unmount();
        expect(cancelBackgroundTransition).toHaveBeenCalledTimes(1);
    });

    it.each([undefined, CONST.BOOT_SPLASH_STATE.VISIBLE, CONST.BOOT_SPLASH_STATE.READY_TO_BE_HIDDEN])(
        'keeps splash state %s hidden even after anonymous transitions complete',
        (splashScreenState) => {
            // Given a non-hidden splash, finishing navigation alone must not mount the background.
            jest.mocked(useSplashScreenState).mockReturnValue({splashScreenState});
            const background = render(<BackgroundImage width={320} />);
            expect(background.toJSON()).toBeNull();
            const transition = jest.mocked(TransitionTracker.runAfterTransitions).mock.calls.at(0)?.[0];
            if (!transition) {
                throw new Error('Expected the anonymous background transition');
            }

            // When the selected transition completes first, the independent splash gate must remain closed.
            act(() => {
                transition.callback();
            });
            expect(background.toJSON()).toBeNull();
            expect(mockRenderBackgroundImage).not.toHaveBeenCalled();
            jest.mocked(useSplashScreenState).mockReturnValue({splashScreenState: CONST.BOOT_SPLASH_STATE.HIDDEN});
            background.rerender(<BackgroundImage width={320} />);

            // Then hiding the splash opens the remaining gate without scheduling another transition.
            expect(screen.getByTestId('native-sign-in-background')).toBeTruthy();
            expect(TransitionTracker.runAfterTransitions).toHaveBeenCalledTimes(1);
        },
    );

    it.each([undefined, CONST.BOOT_SPLASH_STATE.VISIBLE, CONST.BOOT_SPLASH_STATE.READY_TO_BE_HIDDEN])(
        'keeps signed-in splash state %s hidden without scheduling anonymous transition work',
        (splashScreenState) => {
            // Given a signed-in mount, the splash gate still applies even though the transition gate is bypassed.
            jest.mocked(isAnonymousUser).mockReturnValue(false);
            jest.mocked(useSplashScreenState).mockReturnValue({splashScreenState});
            const background = render(<BackgroundImage width={320} />);
            expect(background.toJSON()).toBeNull();
            expect(mockRenderBackgroundImage).not.toHaveBeenCalled();

            // When the splash hides, the image can mount immediately without an anonymous callback.
            jest.mocked(useSplashScreenState).mockReturnValue({splashScreenState: CONST.BOOT_SPLASH_STATE.HIDDEN});
            background.rerender(<BackgroundImage width={320} />);

            // Then no transition handle is created or cancelled for this signed-in mount.
            expect(screen.getByTestId('native-sign-in-background')).toBeTruthy();
            expect(TransitionTracker.runAfterTransitions).not.toHaveBeenCalled();
            background.unmount();
            expect(cancelBackgroundTransition).not.toHaveBeenCalled();
        },
    );

    it('cancels pending anonymous work and keeps its effect tied to the original mount', () => {
        // Given an anonymous mount with a pending callback, session rerenders must not replace its handle.
        jest.mocked(isAnonymousUser).mockImplementation((session) => session === anonymousSession);
        const background = render(<BackgroundImage width={320} />);
        expect(background.toJSON()).toBeNull();

        // When the session signs in, the gate opens without waiting for the pending transition.
        jest.mocked(useSession).mockReturnValue(signedInSession);
        background.rerender(<BackgroundImage width={640} />);
        expect(screen.getByTestId('native-sign-in-background')).toBeTruthy();

        // When it becomes anonymous again, the gate closes and the mount-only effect schedules nothing new.
        jest.mocked(useSession).mockReturnValue(anonymousSession);
        background.rerender(<BackgroundImage width={0} />);
        expect(background.toJSON()).toBeNull();
        expect(isAnonymousUser).toHaveBeenLastCalledWith(anonymousSession);
        expect(TransitionTracker.runAfterTransitions).toHaveBeenCalledTimes(1);
        expect(cancelBackgroundTransition).not.toHaveBeenCalled();
        background.unmount();

        // Then unmount cancels the original pending work even though no transition callback ran.
        expect(cancelBackgroundTransition).toHaveBeenCalledTimes(1);
    });

    it('does not start transition work when a signed-in mount later becomes anonymous', () => {
        // Given a signed-in mount, its mount-only effect has no anonymous transition handle.
        jest.mocked(isAnonymousUser).mockImplementation((session) => session === anonymousSession);
        jest.mocked(useSession).mockReturnValue(signedInSession);
        const background = render(<BackgroundImage width={320} />);
        expect(screen.getByTestId('native-sign-in-background')).toBeTruthy();

        // When the session becomes anonymous, the gate closes because no transition ever completed.
        jest.mocked(useSession).mockReturnValue(anonymousSession);
        background.rerender(<BackgroundImage width={640} />);
        expect(background.toJSON()).toBeNull();

        // When it signs in again, the image returns at its new width.
        jest.mocked(useSession).mockReturnValue(signedInSession);
        background.rerender(<BackgroundImage width={640} />);
        expect(screen.getByTestId('native-sign-in-background')).toBeTruthy();
        expect(background.root).toHaveStyle({width: 640});

        // Then the live splash hook can still close and reopen rendering without creating transition work.
        jest.mocked(useSplashScreenState).mockReturnValue({splashScreenState: CONST.BOOT_SPLASH_STATE.VISIBLE});
        background.rerender(<BackgroundImage width={640} />);
        expect(background.toJSON()).toBeNull();
        jest.mocked(useSplashScreenState).mockReturnValue({splashScreenState: CONST.BOOT_SPLASH_STATE.HIDDEN});
        background.rerender(<BackgroundImage width={640} />);
        expect(screen.getByTestId('native-sign-in-background')).toBeTruthy();
        expect(TransitionTracker.runAfterTransitions).not.toHaveBeenCalled();
        background.unmount();
        expect(cancelBackgroundTransition).not.toHaveBeenCalled();
    });

    it('preserves the numeric native source and ordered width overrides through zero and positive widths', () => {
        // Given conflicting base styles, zero must override the base width just as a positive width does.
        jest.mocked(isAnonymousUser).mockReturnValue(false);
        const background = render(<BackgroundImage width={0} />);

        // When the same mounted component receives zero, positive, then zero width, inspect each actual image call.
        for (const width of [0, 320, 0]) {
            background.rerender(<BackgroundImage width={width} />);
            expect(screen.getByTestId('native-sign-in-background')).toBeTruthy();
            const imageProps = mockRenderBackgroundImage.mock.calls.at(-1)?.[0];
            if (!imageProps) {
                throw new Error('Expected native background image props');
            }

            // Then both style arrays retain their order and last-value-wins behavior, with the exact native asset.
            expect(imageProps.source).toBe(7);
            expect(imageProps.style).toEqual([backgroundStyles.signInBackground, {width}]);
            expect(StyleSheet.flatten(imageProps.style)).toMatchObject({width});
            expect(background.root).toHaveProp('style', [backgroundStyles.signInBackground, {width}, {opacity: 0}]);
            expect(background.root).toHaveStyle({width, opacity: 0});
            expect(imageProps.pointerEvents).toBe('none');
            expect(imageProps.accessibilityIgnoresInvertColors).toBe(true);
            expect(imageProps.transition).toBe(CONST.BACKGROUND_IMAGE_TRANSITION_DURATION);
        }
        expect(TransitionTracker.runAfterTransitions).not.toHaveBeenCalled();
    });

    it('starts the opacity timing and shared-value update only when the real image load handler runs', () => {
        // Given a rendered image, mounting alone must leave the background transparent.
        jest.mocked(isAnonymousUser).mockReturnValue(false);
        const background = render(<BackgroundImage width={320} />);
        expect(screen.getByTestId('native-sign-in-background')).toBeTruthy();
        const imageProps = mockRenderBackgroundImage.mock.calls.at(-1)?.[0];
        const opacityResult = jest.mocked(useSharedValue).mock.results.at(-1);
        const finishImageLoad = imageProps?.onLoadEnd;
        if (!finishImageLoad || opacityResult?.type !== 'return') {
            throw new Error('Expected the native image load handler and shared opacity');
        }
        expect(useSharedValue).toHaveBeenCalledWith(0);
        expect(opacityResult.value.get()).toBe(0);
        expect(background.root).toHaveStyle({opacity: 0});
        expect(withTiming).not.toHaveBeenCalled();

        // When the production onLoadEnd handler fires, it must request the existing fade configuration.
        act(() => {
            finishImageLoad();
        });

        // Then the timing result reaches the same shared value with the exact target, duration and easing.
        expect(withTiming).toHaveBeenCalledTimes(1);
        expect(withTiming).toHaveBeenCalledWith(1, {duration: CONST.MICROSECONDS_PER_MS, easing: Easing.ease});
        expect(opacityResult.value.get()).toBe(1);
    });
});
