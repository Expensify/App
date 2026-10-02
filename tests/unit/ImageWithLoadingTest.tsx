import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ImageWithLoading from '@components/ImageWithLoading';

import CONST from '@src/CONST';

import type ReactNative from 'react-native';

import React from 'react';

const FULL_IMAGE_URI = 'https://example.com/receipt.jpg';
const PREVIEW_URI = 'https://example.com/receipt-preview.jpg';

let mockIsOffline = false;

jest.mock('@hooks/useNetwork', () => () => ({isOffline: mockIsOffline}));

jest.mock('@components/Image', () => {
    const MockReact = jest.requireActual<typeof React>('react');
    const {View} = jest.requireActual<typeof ReactNative>('react-native');
    function MockImage({source, ...props}: {source?: {uri?: string}}) {
        return MockReact.createElement(View, {testID: source?.uri === PREVIEW_URI ? 'preview-image' : 'full-image', ...props});
    }
    return {__esModule: true, default: MockImage};
});

jest.mock('@components/LoadingIndicator', () => {
    const MockReact = jest.requireActual<typeof React>('react');
    const {View} = jest.requireActual<typeof ReactNative>('react-native');
    return {__esModule: true, default: () => MockReact.createElement(View, {testID: 'loading-indicator'})};
});

function renderImage(props: Partial<React.ComponentProps<typeof ImageWithLoading>> = {}) {
    const onError = jest.fn();
    const onLoad = jest.fn();
    render(
        <ImageWithLoading
            source={{uri: FULL_IMAGE_URI}}
            isAuthTokenRequired={false}
            onError={onError}
            onLoad={onLoad}
            {...props}
        />,
    );
    return {onError, onLoad};
}

function startLoading() {
    fireEvent(screen.getByTestId('full-image'), 'loadStart');
}

describe('ImageWithLoading', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        mockIsOffline = false;
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('fails the load when the spinner is still showing after the timeout', () => {
        // Given an image whose full version starts loading and never emits onLoad or onError
        const {onError} = renderImage();
        startLoading();
        act(() => {
            jest.advanceTimersByTime(200);
        });
        expect(screen.getByTestId('loading-indicator')).toBeTruthy();

        // When the spinner has been on screen for the whole timeout
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.ACTIVITY_INDICATOR_TIMEOUT);
        });

        // Then the load is treated as a failure so the parent shows its error UI instead of an endless spinner
        expect(onError).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('loading-indicator')).toBeNull();
    });

    it('fails a stuck load that is shown over a preview', () => {
        // Given a preview is shown while the full image loads, so the spinner shows right away
        const {onError} = renderImage({previewUri: PREVIEW_URI});
        startLoading();
        expect(screen.getByTestId('loading-indicator')).toBeTruthy();

        // When the full image never finishes within the timeout
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.ACTIVITY_INDICATOR_TIMEOUT);
        });

        // Then the load fails and both the spinner and the preview go away
        expect(onError).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('loading-indicator')).toBeNull();
        expect(screen.queryByTestId('preview-image')).toBeNull();
    });

    it('does not fail an image that loads before the timeout', () => {
        // Given an image that is loading behind a spinner
        const {onError, onLoad} = renderImage();
        startLoading();
        act(() => {
            jest.advanceTimersByTime(200);
        });

        // When the image loads and the timeout then passes
        fireEvent(screen.getByTestId('full-image'), 'load', {nativeEvent: {width: 100, height: 100}});
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.ACTIVITY_INDICATOR_TIMEOUT);
        });

        // Then the timer was cleared with the spinner and never reports an error
        expect(onLoad).toHaveBeenCalledTimes(1);
        expect(onError).not.toHaveBeenCalled();
    });

    it('does not fail a cached image that never shows the spinner', () => {
        // Given a cached image with no preview, which loads within the 200 ms spinner delay
        const {onError} = renderImage();
        startLoading();
        fireEvent(screen.getByTestId('full-image'), 'load', {nativeEvent: {width: 100, height: 100}});

        // When the timeout passes
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.ACTIVITY_INDICATOR_TIMEOUT);
        });

        // Then no spinner was shown, so no timer ran and nothing failed
        expect(screen.queryByTestId('loading-indicator')).toBeNull();
        expect(onError).not.toHaveBeenCalled();
    });

    it('does not fail the load while offline', () => {
        // Given the device is offline, where the offline indicator owns the waiting state
        mockIsOffline = true;
        const {onError} = renderImage();
        startLoading();

        // When the timeout passes
        act(() => {
            jest.advanceTimersByTime(200 + CONST.TIMING.ACTIVITY_INDICATOR_TIMEOUT);
        });

        // Then the load is not failed, so the image can still load once the device is back online
        expect(onError).not.toHaveBeenCalled();
    });
});
