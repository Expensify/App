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

jest.mock('@components/ImageLoadTimeoutNotice', () => {
    const MockReact = jest.requireActual<typeof React>('react');
    const {View, Pressable} = jest.requireActual<typeof ReactNative>('react-native');
    return {
        __esModule: true,
        default: ({onRetry}: {onRetry: () => void}) =>
            MockReact.createElement(View, {testID: 'load-timeout-notice'}, MockReact.createElement(Pressable, {testID: 'retry-button', onPress: onRetry})),
    };
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

    it('stops the spinner and offers a retry when the load runs past the timeout', () => {
        // Given an image whose full version starts loading and never emits onLoad or onError
        const {onError} = renderImage();
        startLoading();
        act(() => {
            jest.advanceTimersByTime(200);
        });
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

    it('keeps the preview mounted when a load times out over it', () => {
        // Given a preview is shown while the full image loads, so the spinner shows right away
        const {onError} = renderImage({previewUri: PREVIEW_URI});
        startLoading();
        expect(screen.getByTestId('loading-indicator')).toBeTruthy();

        // When the full image never finishes within the timeout
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.IMAGE_LOAD_CEILING_TIMEOUT);
        });

        // Then only the spinner goes away: the preview that had already loaded stays visible with a retry
        expect(screen.queryByTestId('loading-indicator')).toBeNull();
        expect(screen.getByTestId('preview-image')).toBeTruthy();
        expect(screen.getByTestId('retry-button')).toBeTruthy();
        expect(onError).not.toHaveBeenCalled();
    });

    it('still shows an image that loads after the timeout', () => {
        // Given a load that already timed out over its preview
        const {onError, onLoad} = renderImage({previewUri: PREVIEW_URI});
        startLoading();
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.IMAGE_LOAD_CEILING_TIMEOUT);
        });

        // When the slow load finally finishes
        fireEvent(screen.getByTestId('full-image'), 'load', {nativeEvent: {width: 100, height: 100}});

        // Then the timeout notice goes away and the load reports as a success
        expect(screen.queryByTestId('retry-button')).toBeNull();
        expect(onLoad).toHaveBeenCalledTimes(1);
        expect(onError).not.toHaveBeenCalled();
    });

    it('restarts the load and the timer when retry is pressed', () => {
        // Given a load that already timed out
        const {onError} = renderImage();
        startLoading();
        act(() => {
            jest.advanceTimersByTime(200);
        });
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.IMAGE_LOAD_CEILING_TIMEOUT);
        });
        expect(screen.getByTestId('retry-button')).toBeTruthy();

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

    it('reports a real load error to the parent', () => {
        // Given an image that is loading
        const {onError} = renderImage();
        startLoading();
        act(() => {
            jest.advanceTimersByTime(200);
        });

        // When the image emits a real error
        fireEvent(screen.getByTestId('full-image'), 'error');

        // Then the parent is told and the spinner goes away
        expect(onError).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('loading-indicator')).toBeNull();
    });

    it('keeps the spinner on a slow load that keeps sending bytes', () => {
        // Given a load that is past the no-progress ceiling but still reporting download progress
        const {onError} = renderImage({previewUri: PREVIEW_URI});
        startLoading();

        // When progress arrives repeatedly, each step shorter than the stall window, for far longer
        // than the ceiling
        for (let i = 0; i < 4; i++) {
            act(() => {
                jest.advanceTimersByTime(CONST.TIMING.IMAGE_LOAD_CEILING_TIMEOUT - 1000);
            });
            fireEvent(screen.getByTestId('full-image'), 'progress', {nativeEvent: {loaded: (i + 1) * 1000, total: 10000}});
        }

        // Then the spinner keeps spinning and nothing is reported
        expect(screen.getByTestId('loading-indicator')).toBeTruthy();
        expect(screen.queryByTestId('retry-button')).toBeNull();
        expect(onError).not.toHaveBeenCalled();
    });

    it('does not report a timeout for an image that loads before the timeout', () => {
        // Given an image that is loading behind a spinner
        const {onError, onLoad} = renderImage();
        startLoading();
        act(() => {
            jest.advanceTimersByTime(200);
        });

        // When the image loads and the timeout then passes
        fireEvent(screen.getByTestId('full-image'), 'load', {nativeEvent: {width: 100, height: 100}});
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.IMAGE_LOAD_CEILING_TIMEOUT);
        });

        // Then the timer was cleared with the spinner and never reports an error
        expect(onLoad).toHaveBeenCalledTimes(1);
        expect(onError).not.toHaveBeenCalled();
    });

    it('does not report a timeout for a cached image that never shows the spinner', () => {
        // Given a cached image with no preview, which loads within the 200 ms spinner delay
        const {onError} = renderImage();
        startLoading();
        fireEvent(screen.getByTestId('full-image'), 'load', {nativeEvent: {width: 100, height: 100}});

        // When the timeout passes
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.IMAGE_LOAD_CEILING_TIMEOUT);
        });

        // Then no spinner was shown, so no timer ran and nothing was reported
        expect(screen.queryByTestId('loading-indicator')).toBeNull();
        expect(onError).not.toHaveBeenCalled();
    });

    it('does not report a timeout while offline', () => {
        // Given the device is offline, where the offline indicator owns the waiting state
        mockIsOffline = true;
        const {onError} = renderImage();
        startLoading();

        // When the timeout passes
        act(() => {
            jest.advanceTimersByTime(200 + CONST.TIMING.IMAGE_LOAD_CEILING_TIMEOUT);
        });

        // Then no timeout notice is offered, so the image can still load once the device is back online
        expect(screen.queryByTestId('loading-indicator')).toBeNull();
        expect(screen.queryByTestId('retry-button')).toBeNull();
        expect(onError).not.toHaveBeenCalled();
    });
});
