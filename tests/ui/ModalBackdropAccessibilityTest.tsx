import {fireEvent, render, screen} from '@testing-library/react-native';

import NativeBackdrop from '@components/Modal/ReanimatedModal/Backdrop';
import WebBackdrop from '@components/Modal/ReanimatedModal/Backdrop/index.web';

import type {GestureResponderEvent, MeasureOnSuccessCallback} from 'react-native';

import React from 'react';
import {Platform} from 'react-native';

import createMock from '../utils/createMock';

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));

describe.each([
    {platform: 'ios', Backdrop: NativeBackdrop},
    {platform: 'android', Backdrop: NativeBackdrop},
    {platform: 'web', Backdrop: WebBackdrop},
] as const)('Modal backdrop accessibility on $platform', ({platform, Backdrop}) => {
    beforeEach(() => {
        jest.replaceProperty(Platform, 'OS', platform);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    function renderBackdrop() {
        const onBackdropPress = jest.fn();
        render(
            <Backdrop
                isBackdropVisible
                style={{width: 1180, height: 820}}
                onBackdropPress={onBackdropPress}
            />,
        );
        return onBackdropPress;
    }

    it('exposes a Dismiss button that supports semantic activation', () => {
        // Given assistive technology needs a named action rather than an unlabeled dimming layer
        const onBackdropPress = renderBackdrop();
        const dismiss = screen.getByRole('button', {name: 'common.dismiss'});

        // When the backdrop is activated through its button semantics
        fireEvent.press(dismiss);

        // Then the same dismissal callback must be reachable without a pointer gesture
        expect(onBackdropPress).toHaveBeenCalledTimes(1);
    });

    it('dismisses once on a completed touch rather than on both touch-down and activation', () => {
        // Given a single touch generates several press lifecycle events
        const onBackdropPress = renderBackdrop();
        const dismiss = screen.getByRole('button', {name: 'common.dismiss'});

        // When the touch begins and then completes normally
        fireEvent(dismiss, 'pressIn');
        expect(onBackdropPress).not.toHaveBeenCalled();
        fireEvent(dismiss, 'pressOut');
        fireEvent.press(dismiss);

        // Then dismissal must wait for completion and must not run twice for one touch
        expect(onBackdropPress).toHaveBeenCalledTimes(1);
    });

    if (platform !== 'web') {
        it('gives the dismissal target full-screen bounds rather than sizing it from its absolute child', () => {
            // Given an absolutely positioned visual child cannot give its pressable parent a measurable size
            // When native lays out the backdrop's dismissal target
            renderBackdrop();

            // Then the target must fill the window so presses outside the dialog are not lost
            expect(screen.getByRole('button', {name: 'common.dismiss'})).toHaveStyle({position: 'absolute', top: 0, right: 0, bottom: 0, left: 0});
        });

        it('dismisses after a small finger movement within the measured backdrop', () => {
            // Given natural finger movement must stay inside a measurable native press region
            const onBackdropPress = renderBackdrop();
            const dismiss = screen.getByRole('button', {name: 'common.dismiss'});
            const measure = jest.fn((callback: MeasureOnSuccessCallback) => callback(0, 0, 1180, 820, 0, 0));
            const touch = (pageY: number) =>
                createMock<GestureResponderEvent>({
                    currentTarget: {measure},
                    persist: jest.fn(),
                    nativeEvent: {pageX: 100, pageY},
                });

            // When the native responder handles a slightly moving touch, rather than bypassing cancellation with fireEvent.press
            fireEvent(dismiss, 'responderGrant', touch(400));
            expect(measure).toHaveBeenCalled();
            expect(onBackdropPress).not.toHaveBeenCalled();
            fireEvent(dismiss, 'responderMove', touch(402));
            fireEvent(dismiss, 'responderRelease', touch(402));

            // Then a valid touch must dismiss once instead of being canceled by a zero-sized backdrop
            expect(onBackdropPress).toHaveBeenCalledTimes(1);
        });

        it('dismisses through the native accessibility activation callback', () => {
            // Given native screen readers can invoke accessibilityTap instead of the ordinary press event
            const onBackdropPress = renderBackdrop();

            // When a screen reader activates the backdrop through that native callback
            fireEvent(screen.getByRole('button', {name: 'common.dismiss'}), 'accessibilityTap');

            // Then accessibility users must have the same dismissal path as touch users
            expect(onBackdropPress).toHaveBeenCalledTimes(1);
        });
    }
});
