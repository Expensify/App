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
        const onBackdropPress = renderBackdrop();
        const dismiss = screen.getByRole('button', {name: 'common.dismiss'});

        fireEvent.press(dismiss);

        expect(onBackdropPress).toHaveBeenCalledTimes(1);
    });

    it('dismisses once on a completed touch rather than on both touch-down and activation', () => {
        const onBackdropPress = renderBackdrop();
        const dismiss = screen.getByRole('button', {name: 'common.dismiss'});

        fireEvent(dismiss, 'pressIn');
        expect(onBackdropPress).not.toHaveBeenCalled();
        fireEvent(dismiss, 'pressOut');
        fireEvent.press(dismiss);

        expect(onBackdropPress).toHaveBeenCalledTimes(1);
    });

    if (platform !== 'web') {
        it('gives the dismissal target full-screen bounds rather than sizing it from its absolute child', () => {
            renderBackdrop();

            expect(screen.getByRole('button', {name: 'common.dismiss'})).toHaveStyle({position: 'absolute', top: 0, right: 0, bottom: 0, left: 0});
        });

        it('dismisses after a small finger movement within the measured backdrop', () => {
            const onBackdropPress = renderBackdrop();
            const dismiss = screen.getByRole('button', {name: 'common.dismiss'});
            const measure = jest.fn((callback: MeasureOnSuccessCallback) => callback(0, 0, 1180, 820, 0, 0));
            const touch = (pageY: number) =>
                createMock<GestureResponderEvent>({
                    currentTarget: {measure},
                    persist: jest.fn(),
                    nativeEvent: {pageX: 100, pageY},
                });

            // Exercise the native measured press region; fireEvent.press bypasses touch cancellation.
            fireEvent(dismiss, 'responderGrant', touch(400));
            expect(measure).toHaveBeenCalled();
            expect(onBackdropPress).not.toHaveBeenCalled();
            fireEvent(dismiss, 'responderMove', touch(402));
            fireEvent(dismiss, 'responderRelease', touch(402));

            expect(onBackdropPress).toHaveBeenCalledTimes(1);
        });

        it('dismisses through the native accessibility activation callback', () => {
            const onBackdropPress = renderBackdrop();

            fireEvent(screen.getByRole('button', {name: 'common.dismiss'}), 'accessibilityTap');

            expect(onBackdropPress).toHaveBeenCalledTimes(1);
        });
    }
});
