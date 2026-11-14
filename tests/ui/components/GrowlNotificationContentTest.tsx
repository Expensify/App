import {act, fireEvent, render, screen} from '@testing-library/react-native';

import GrowlNotificationContent from '@components/GrowlNotification/GrowlNotificationContent';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';

import type {GrowlPosition} from '@libs/Growl';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {StyleSheet, View} from 'react-native';
import * as Reanimated from 'react-native-reanimated';

jest.mock('@hooks/useResponsiveLayout');
jest.mock('@hooks/useSafeAreaInsets', () => ({__esModule: true, default: () => ({top: 44, bottom: 34, left: 0, right: 0})}));
jest.mock('react-native-gesture-handler', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-native-gesture-handler'),
    GestureDetector: ({children}: {children: React.ReactNode}) => children,
    useFlingGesture: jest.fn(() => ({})),
}));

const BODY_TEXT = 'You’ve been signed out on all devices.';

function getAnchoredContainer() {
    const container = screen.UNSAFE_getAllByType(View).find((view) => {
        const style = StyleSheet.flatten<unknown>(view.props.style);
        return (
            !!style &&
            typeof style === 'object' &&
            (('top' in style && style.top === variables.growlNotificationInset) || ('bottom' in style && style.bottom === variables.growlNotificationInset))
        );
    });
    if (!container) {
        throw new Error('Expected a growl anchored to a screen edge');
    }
    return container;
}

function getGrowlWrapper() {
    const wrapper = screen.UNSAFE_getAllByType(View).find((view) => {
        const style = StyleSheet.flatten<unknown>(view.props.style);
        return !!style && typeof style === 'object' && 'zIndex' in style && style.zIndex === variables.growlNotificationZIndex;
    });
    if (!wrapper) {
        throw new Error('Expected the growl overlay wrapper');
    }
    return wrapper;
}

describe('Native Growl placement', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.spyOn(Reanimated, 'withSpring').mockImplementation((value, _config, onComplete) => {
            onComplete?.(true);
            return value;
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    it.each([undefined, CONST.GROWL.POSITION.BOTTOM_RIGHT])('anchors position %p to the requested edge and keeps safe-area clearance', (position: GrowlPosition | undefined) => {
        // Given an ordinary toast or a toast that explicitly requests the bottom edge
        render(
            <GrowlNotificationContent
                bodyText={BODY_TEXT}
                type={CONST.GROWL.SUCCESS}
                duration={5000}
                nonce={1}
                onDismissed={jest.fn()}
                position={position}
            />,
        );

        // When the native toast becomes visible
        const container = getAnchoredContainer();
        const style = StyleSheet.flatten<unknown>(container.props.style);

        // Then its rendered native anchor honors the request without changing the ordinary top default
        expect(style).toMatchObject({position: 'absolute', [position ? 'bottom' : 'top']: variables.growlNotificationInset});
        expect(style).not.toHaveProperty(position ? 'top' : 'bottom');
        expect(style).toMatchObject({paddingTop: 44, paddingBottom: 34 * variables.iosSafeAreaInsetsPercentage});

        const wrapperStyle = StyleSheet.flatten<unknown>(getGrowlWrapper().props.style);
        if (position) {
            expect(wrapperStyle).toMatchObject({position: 'absolute', top: 0, bottom: 0, left: 0, right: 0});
        } else {
            expect(wrapperStyle).not.toHaveProperty('bottom');
        }
    });

    it('keeps the fullscreen bottom overlay transparent to touches outside the toast', () => {
        // Given a sign-in control and the growl share the app root
        const onSignIn = jest.fn();
        const onDismissed = jest.fn();
        render(
            <View>
                <PressableWithoutFeedback
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel="Sign in"
                    sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                    onPress={onSignIn}
                />
                <GrowlNotificationContent
                    bodyText={BODY_TEXT}
                    type={CONST.GROWL.SUCCESS}
                    duration={5000}
                    nonce={3}
                    onDismissed={onDismissed}
                    position={CONST.GROWL.POSITION.BOTTOM_RIGHT}
                />
            </View>,
        );

        // When the toast is onscreen, only its children may receive touches through the overlay
        expect(getGrowlWrapper().props.pointerEvents).toBe('box-none');
        expect(getAnchoredContainer().props.pointerEvents).toBe('box-none');
        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: 'Sign in'}));

        // Then the underlying control remains independently usable without dismissing the toast
        expect(onSignIn).toHaveBeenCalledTimes(1);
        expect(onDismissed).not.toHaveBeenCalled();
    });

    it.each([undefined, CONST.GROWL.POSITION.BOTTOM_RIGHT])('dismisses position %p by tapping the existing toast', (position: GrowlPosition | undefined) => {
        // Given a visible toast using either supported anchor
        const onDismissed = jest.fn();
        render(
            <GrowlNotificationContent
                bodyText={BODY_TEXT}
                type={CONST.GROWL.SUCCESS}
                duration={5000}
                nonce={7}
                onDismissed={onDismissed}
                position={position}
            />,
        );

        // When the user taps its text
        fireEvent.press(screen.getByLabelText(BODY_TEXT));
        act(() => jest.advanceTimersByTime(0));

        // Then the existing dismissal callback is called for that toast
        expect(onDismissed).toHaveBeenCalledWith(7);
    });

    it('automatically dismisses an explicitly bottom-anchored toast after its duration', () => {
        // Given a bottom toast with a finite display duration
        const onDismissed = jest.fn();
        render(
            <GrowlNotificationContent
                bodyText={BODY_TEXT}
                type={CONST.GROWL.SUCCESS}
                duration={5000}
                nonce={9}
                onDismissed={onDismissed}
                position={CONST.GROWL.POSITION.BOTTOM_RIGHT}
            />,
        );

        // When the display duration elapses
        act(() => jest.advanceTimersByTime(5000));

        // Then the same dismissal path completes without leaving the toast stuck onscreen
        expect(onDismissed).toHaveBeenCalledWith(9);
    });
});
