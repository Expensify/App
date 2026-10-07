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

jest.mock('@components/ImageLoadTimeoutNotice', () => {
    const MockReact = jest.requireActual<typeof React>('react');
    const {View, Pressable} = jest.requireActual<typeof ReactNative>('react-native');
    return {
        __esModule: true,
        default: ({onRetry}: {onRetry: () => void}) =>
            MockReact.createElement(View, {testID: 'load-timeout-notice'}, MockReact.createElement(Pressable, {testID: 'retry-button', onPress: onRetry})),
    };
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

    it('stops the spinner and offers a retry when the load runs past the timeout', () => {
        // Given a full-size image that never emits onLoad or onError
        const {onError} = renderImageView();
        expect(screen.getByTestId('loading-indicator')).toBeTruthy();

        // When the spinner has been on screen for the whole timeout
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.IMAGE_LOAD_CEILING_TIMEOUT);
        });

        // Then the spinner is replaced by a retry option, and the parent is not told the load failed
        expect(screen.queryByTestId('loading-indicator')).toBeNull();
        expect(screen.getByTestId('retry-button')).toBeTruthy();
        expect(onError).not.toHaveBeenCalled();
    });

    it('still shows an image that loads after the timeout', () => {
        // Given a load that already timed out
        const {onError} = renderImageView();
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.IMAGE_LOAD_CEILING_TIMEOUT);
        });
        expect(screen.getByTestId('retry-button')).toBeTruthy();

        // When the slow load finally finishes
        fireEvent(screen.getByTestId('full-image'), 'load', {nativeEvent: {width: 100, height: 100}});

        // Then the timeout notice goes away and no failure is reported
        expect(screen.queryByTestId('retry-button')).toBeNull();
        expect(screen.queryByTestId('loading-indicator')).toBeNull();
        expect(onError).not.toHaveBeenCalled();
    });

    it('restarts the load and the timer when retry is pressed', () => {
        // Given a load that already timed out
        const {onError} = renderImageView();
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.IMAGE_LOAD_CEILING_TIMEOUT);
        });

        // When the user presses retry
        fireEvent.press(screen.getByTestId('retry-button'));

        // Then the spinner shows again on a remounted image and gets a fresh timeout
        expect(screen.getByTestId('loading-indicator')).toBeTruthy();
        expect(screen.queryByTestId('retry-button')).toBeNull();
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.IMAGE_LOAD_CEILING_TIMEOUT);
        });
        expect(screen.getByTestId('retry-button')).toBeTruthy();
        expect(onError).not.toHaveBeenCalled();
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

    it('does not report a timeout for an image that loads before the timeout', () => {
        // Given a full-size image that is loading
        const {onError} = renderImageView();

        // When the image loads and the timeout then passes
        fireEvent(screen.getByTestId('full-image'), 'load', {nativeEvent: {width: 100, height: 100}});
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.IMAGE_LOAD_CEILING_TIMEOUT);
        });

        // Then the timer was cleared with the spinner and never reports an error
        expect(screen.queryByTestId('loading-indicator')).toBeNull();
        expect(onError).not.toHaveBeenCalled();
    });

    it('does not report a timeout while offline', () => {
        // Given the device is offline while the image is loading
        mockIsOffline = true;
        const {onError} = renderImageView();

        // When the timeout passes
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.IMAGE_LOAD_CEILING_TIMEOUT);
        });

        // Then no timeout notice is offered, so the image can still load once the device is back online
        expect(screen.queryByTestId('retry-button')).toBeNull();
        expect(onError).not.toHaveBeenCalled();
    });
});
