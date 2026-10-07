import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ImageWithSizeCalculation from '@components/ImageWithSizeCalculation';

import CONST from '@src/CONST';

import type ReactNative from 'react-native';

import React from 'react';

const IMAGE_URI = 'https://example.com/receipt.jpg';

let mockIsOffline = false;

jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {hmmm: jest.fn()},
}));

const mockLogHmmm = jest.requireMock<{default: {hmmm: jest.Mock}}>('@libs/Log').default.hmmm;

jest.mock('@hooks/useNetwork', () => () => ({isOffline: mockIsOffline}));

jest.mock('@hooks/useThemeStyles', () => () => new Proxy({}, {get: () => ({})}));

// The real ImageWithLoading runs the timeout; only its leaf components are stubbed.
jest.mock('@components/Image', () => {
    const MockReact = jest.requireActual<typeof React>('react');
    const {View} = jest.requireActual<typeof ReactNative>('react-native');
    return {__esModule: true, default: (props: Record<string, unknown>) => MockReact.createElement(View, {testID: 'image', ...props})};
});

jest.mock('@components/LoadingIndicator', () => {
    const MockReact = jest.requireActual<typeof React>('react');
    const {View} = jest.requireActual<typeof ReactNative>('react-native');
    return {__esModule: true, default: () => MockReact.createElement(View, {testID: 'loading-indicator'})};
});

jest.mock('@components/AttachmentOfflineIndicator', () => {
    const MockReact = jest.requireActual<typeof React>('react');
    const {View} = jest.requireActual<typeof ReactNative>('react-native');
    return {__esModule: true, default: () => MockReact.createElement(View, {testID: 'offline-indicator'})};
});

jest.mock('@components/ImageLoadTimeoutNotice', () => {
    const MockReact = jest.requireActual<typeof React>('react');
    const {Pressable} = jest.requireActual<typeof ReactNative>('react-native');
    return {
        __esModule: true,
        default: ({onRetry}: {onRetry: () => void}) => MockReact.createElement(Pressable, {testID: 'retry-button', onPress: onRetry}),
    };
});

function renderImage() {
    const onMeasure = jest.fn();
    const onLoadFailure = jest.fn();
    render(
        <ImageWithSizeCalculation
            url={IMAGE_URI}
            isAuthTokenRequired={false}
            onMeasure={onMeasure}
            onLoadFailure={onLoadFailure}
        />,
    );
    return {onMeasure, onLoadFailure};
}

describe('ImageWithSizeCalculation', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
        mockIsOffline = false;
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('does not report a slow load that runs past the spinner timeout', () => {
        // Given an image whose load never emits onLoad or onError
        const {onLoadFailure} = renderImage();
        fireEvent(screen.getByTestId('image'), 'loadStart');
        act(() => {
            jest.advanceTimersByTime(200);
        });
        expect(screen.getByTestId('loading-indicator')).toBeTruthy();

        // When the spinner timeout elapses
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.IMAGE_LOAD_CEILING_TIMEOUT);
        });

        // Then the load is not logged as a size-fetch failure and the parent keeps its image instead of a fallback
        expect(mockLogHmmm).not.toHaveBeenCalled();
        expect(onLoadFailure).not.toHaveBeenCalled();
        expect(screen.getByTestId('retry-button')).toBeTruthy();
    });

    it('logs and reports a load that errors', () => {
        // Given an image that is loading
        const {onLoadFailure} = renderImage();
        fireEvent(screen.getByTestId('image'), 'loadStart');

        // When the image emits a real error
        fireEvent(screen.getByTestId('image'), 'error');

        // Then the size fetch is reported as failed
        expect(mockLogHmmm).toHaveBeenCalledTimes(1);
        expect(onLoadFailure).toHaveBeenCalledTimes(1);
    });
});
