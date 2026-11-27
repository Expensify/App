import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ImageLoadEventContext from '@components/ImageLoadEventContext';
import ReceiptImage from '@components/ReceiptImage';

import CONST from '@src/CONST';

import type ReactNative from 'react-native';

import React from 'react';

const RECEIPT_URI = 'https://example.com/receipt.jpg';
const OTHER_RECEIPT_URI = 'https://example.com/other-receipt.jpg';

jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));

jest.mock('@hooks/useThemeStyles', () => () => new Proxy({}, {get: () => ({})}));

// The real ImageWithLoading tracks the load; only its leaf components are stubbed.
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

jest.mock('@components/ImageLoadTimeoutNotice', () => {
    const MockReact = jest.requireActual<typeof React>('react');
    const {Pressable} = jest.requireActual<typeof ReactNative>('react-native');
    return {
        __esModule: true,
        default: ({onRetry}: {onRetry: () => void}) => MockReact.createElement(Pressable, {testID: 'retry-button', onPress: onRetry}),
    };
});

describe('ReceiptImage', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('treats the next receipt in the same full-size pane as a new load', () => {
        // Given the full-size receipt in the wide RHP pane, whose load stalled and was retried before it loaded
        const reportImageLoadEvent = jest.fn();
        const renderWithSource = (source: string) => (
            <ImageLoadEventContext.Provider value={reportImageLoadEvent}>
                <ReceiptImage
                    source={source}
                    isAuthTokenRequired={false}
                    shouldUseFullHeight
                />
            </ImageLoadEventContext.Provider>
        );
        const {rerender} = render(renderWithSource(RECEIPT_URI));
        fireEvent(screen.getByTestId('image'), 'loadStart');
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.IMAGE_LOAD_CEILING_TIMEOUT);
        });
        fireEvent.press(screen.getByTestId('retry-button'));
        fireEvent(screen.getByTestId('image'), 'load', {nativeEvent: {width: 100, height: 100}});

        // When the user moves to another expense in the same pane and its receipt loads
        reportImageLoadEvent.mockClear();
        rerender(renderWithSource(OTHER_RECEIPT_URI));
        fireEvent(screen.getByTestId('image'), 'loadStart');
        fireEvent(screen.getByTestId('image'), 'load', {nativeEvent: {width: 100, height: 100}});

        // Then the new receipt is not reported as recovering from the previous receipt's stall
        expect(reportImageLoadEvent).not.toHaveBeenCalled();
    });

    it('watches the next receipt in the same full-size pane for a stall', () => {
        // Given the full-size receipt in the wide RHP pane, which already loaded
        const reportImageLoadEvent = jest.fn();
        const renderWithSource = (source: string) => (
            <ImageLoadEventContext.Provider value={reportImageLoadEvent}>
                <ReceiptImage
                    source={source}
                    isAuthTokenRequired={false}
                    shouldUseFullHeight
                />
            </ImageLoadEventContext.Provider>
        );
        const {rerender} = render(renderWithSource(RECEIPT_URI));
        fireEvent(screen.getByTestId('image'), 'loadStart');
        fireEvent(screen.getByTestId('image'), 'load', {nativeEvent: {width: 100, height: 100}});

        // When the user moves to another expense whose receipt never finishes loading
        rerender(renderWithSource(OTHER_RECEIPT_URI));
        fireEvent(screen.getByTestId('image'), 'loadStart');
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.IMAGE_LOAD_CEILING_TIMEOUT);
        });

        // Then the stall is reported against the new receipt instead of being skipped because the old one had loaded
        expect(reportImageLoadEvent).toHaveBeenLastCalledWith({type: 'stall', reason: 'ceiling', component: 'ImageWithLoading', source: OTHER_RECEIPT_URI});
    });
});
