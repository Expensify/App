import {fireEvent, render, screen} from '@testing-library/react-native';

import NativeBackdrop from '@components/Modal/ReanimatedModal/Backdrop';
import WebBackdrop from '@components/Modal/ReanimatedModal/Backdrop/index.web';

import React from 'react';
import {Platform} from 'react-native';

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
        it('dismisses through the native accessibility activation callback', () => {
            const onBackdropPress = renderBackdrop();

            fireEvent(screen.getByRole('button', {name: 'common.dismiss'}), 'accessibilityTap');

            expect(onBackdropPress).toHaveBeenCalledTimes(1);
        });
    }
});
