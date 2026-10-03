import {act, fireEvent, render, screen} from '@testing-library/react-native';

import type ImageViewProps from '@components/ImageView/types';

import CONST from '@src/CONST';

import type ReactNative from 'react-native';

import React from 'react';

// Load the web implementation explicitly, since Jest resolves the native one by default
const ImageView = jest.requireActual<{default: React.ComponentType<ImageViewProps>}>('@components/ImageView/index.tsx').default;

const IMAGE_URL = 'https://example.com/receipt.jpg';

let mockIsOffline = false;

jest.mock('@hooks/useNetwork', () => () => ({isOffline: mockIsOffline}));

jest.mock('@libs/DeviceCapabilities', () => ({canUseTouchScreen: () => false}));

jest.mock('@components/Image', () => {
    const MockReact = jest.requireActual<typeof React>('react');
    const {View} = jest.requireActual<typeof ReactNative>('react-native');
    return {__esModule: true, default: (props: Record<string, unknown>) => MockReact.createElement(View, {testID: 'full-image', ...props})};
});

jest.mock('@components/LoadingIndicator', () => {
    const MockReact = jest.requireActual<typeof React>('react');
    const {View} = jest.requireActual<typeof ReactNative>('react-native');
    return {__esModule: true, default: () => MockReact.createElement(View, {testID: 'loading-indicator'})};
});

function renderImageView() {
    const onError = jest.fn();
    render(
        <ImageView
            url={IMAGE_URL}
            fileName="receipt.jpg"
            onError={onError}
        />,
    );
    return {onError};
}

describe('ImageView (web)', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        mockIsOffline = false;
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('fails the load when the spinner is still showing after the timeout', () => {
        // Given a full-size image that never emits onLoad or onError
        const {onError} = renderImageView();
        expect(screen.getByTestId('loading-indicator')).toBeTruthy();

        // When the spinner has been on screen for the whole timeout
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.ACTIVITY_INDICATOR_TIMEOUT);
        });

        // Then the load is treated as a failure so the parent can show its error UI instead of an endless spinner
        expect(onError).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('loading-indicator')).toBeNull();
    });

    it('hides the spinner when the image fails to load', () => {
        // Given a full-size image that is loading
        const {onError} = renderImageView();

        // When the image reports an error
        fireEvent(screen.getByTestId('full-image'), 'error');

        // Then the spinner goes away instead of spinning over the parent's error UI
        expect(onError).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('loading-indicator')).toBeNull();
    });

    it('does not fail an image that loads before the timeout', () => {
        // Given a full-size image that is loading
        const {onError} = renderImageView();

        // When the image loads and the timeout then passes
        fireEvent(screen.getByTestId('full-image'), 'load', {nativeEvent: {width: 100, height: 100}});
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.ACTIVITY_INDICATOR_TIMEOUT);
        });

        // Then the timer was cleared with the spinner and never reports an error
        expect(screen.queryByTestId('loading-indicator')).toBeNull();
        expect(onError).not.toHaveBeenCalled();
    });

    it('does not fail the load while offline', () => {
        // Given the device is offline while the image is loading
        mockIsOffline = true;
        const {onError} = renderImageView();

        // When the timeout passes
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.ACTIVITY_INDICATOR_TIMEOUT);
        });

        // Then the load is not failed, so the image can still load once the device is back online
        expect(onError).not.toHaveBeenCalled();
    });
});
