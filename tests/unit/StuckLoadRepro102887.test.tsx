import {act, fireEvent, render, screen} from '@testing-library/react-native';

import CurrentImageWithLoading from '@components/ImageWithLoading';

import CONST from '@src/CONST';

import type ReactNative from 'react-native';

import React from 'react';

import OldImageWithLoading from './repro102887/ImageWithLoading.old';

/**
 * Regression evidence for https://github.com/Expensify/App/pull/102887 review (comment 5996721434).
 * The reviewer saw a receipt whose preview was already on screen disappear at 10s and be replaced by
 * "Attachment not found", because the PR's spinner-age timer fired the component's onError while the
 * full image was still downloading.
 *
 * `./repro102887/ImageWithLoading.old` is src/components/ImageWithLoading.tsx at cbe9ea48458 (PR head,
 * pre-fix), vendored so the broken behaviour is asserted rather than described.
 */

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

jest.mock('@components/AttachmentOfflineIndicator', () => {
    const MockReact = jest.requireActual<typeof React>('react');
    const {View} = jest.requireActual<typeof ReactNative>('react-native');
    return {__esModule: true, default: () => MockReact.createElement(View, {testID: 'offline-indicator'})};
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

jest.mock('@hooks/useThemeStyles', () => () => new Proxy({}, {get: () => ({})}));

type ImageWithLoadingType = typeof CurrentImageWithLoading;

function renderImage(Component: ImageWithLoadingType) {
    const onError = jest.fn();
    const onLoad = jest.fn();
    render(
        <Component
            source={{uri: FULL_IMAGE_URI}}
            isAuthTokenRequired={false}
            previewUri={PREVIEW_URI}
            onError={onError}
            onLoad={onLoad}
        />,
    );
    // The preview is on screen and the full image has begun its download
    fireEvent(screen.getByTestId('full-image'), 'loadStart');
    return {onError, onLoad};
}

describe('#102887 preview dropped by the spinner timeout', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        mockIsOffline = false;
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('at cbe9ea48458 (PR head, pre-fix)', () => {
        it('drops the loaded preview and reports a failure when the full image is still downloading at 10s', () => {
            // Given a receipt whose preview is showing while the full image downloads slowly
            const {onError, onLoad} = renderImage(OldImageWithLoading);
            expect(screen.getByTestId('preview-image')).toBeTruthy();
            expect(screen.getByTestId('loading-indicator')).toBeTruthy();

            // When the spinner has been visible for ACTIVITY_INDICATOR_TIMEOUT and the image still
            // has not emitted onLoad (bytes may still be arriving)
            act(() => {
                jest.advanceTimersByTime(CONST.TIMING.ACTIVITY_INDICATOR_TIMEOUT);
            });

            // Then the load is reported as an error, so the modal shows "Attachment not found", and
            // the preview that was already rendered is unmounted: the reviewer's video
            expect(onError).toHaveBeenCalledTimes(1);
            expect(onLoad).not.toHaveBeenCalled();
            expect(screen.queryByTestId('preview-image')).toBeNull();
        });

        it('still drops the preview when the late load would have succeeded', () => {
            // Given the same slow load that reaches 10s
            const {onError, onLoad} = renderImage(OldImageWithLoading);
            act(() => {
                jest.advanceTimersByTime(CONST.TIMING.ACTIVITY_INDICATOR_TIMEOUT);
            });

            // When the download completes a moment later
            fireEvent(screen.getByTestId('full-image'), 'load', {nativeEvent: {width: 100, height: 100}});

            // Then the failure was already reported; onLoad arriving afterwards does not undo it
            expect(onError).toHaveBeenCalledTimes(1);
            expect(onLoad).toHaveBeenCalledTimes(1);
            expect(screen.queryByTestId('preview-image')).toBeNull();
        });
    });

    describe('on the current branch', () => {
        it('keeps the preview mounted and reports no failure at the same 10s mark', () => {
            // Given the same scenario on the fixed component
            const {onError} = renderImage(CurrentImageWithLoading);
            expect(screen.getByTestId('preview-image')).toBeTruthy();

            // When the same window elapses with no download activity to judge it by
            act(() => {
                jest.advanceTimersByTime(CONST.TIMING.ACTIVITY_INDICATOR_TIMEOUT);
            });

            // Then the parent is never told the load failed, the preview survives, and the user gets
            // a retry instead of "Attachment not found"
            expect(onError).not.toHaveBeenCalled();
            expect(screen.getByTestId('preview-image')).toBeTruthy();
            expect(screen.getByTestId('retry-button')).toBeTruthy();
            expect(screen.queryByTestId('loading-indicator')).toBeNull();
        });

        it('never interrupts a slow download that keeps sending bytes', () => {
            // Given a download that keeps reporting progress, each gap shorter than the stall window
            const {onError, onLoad} = renderImage(CurrentImageWithLoading);

            for (let i = 0; i < 5; i++) {
                act(() => {
                    jest.advanceTimersByTime(CONST.TIMING.IMAGE_LOAD_CEILING_TIMEOUT - 1000);
                });
                fireEvent(screen.getByTestId('full-image'), 'progress', {nativeEvent: {loaded: (i + 1) * 1000, total: 6000}});
            }

            // When it finally finishes, well past the old 10s cutoff
            fireEvent(screen.getByTestId('full-image'), 'load', {nativeEvent: {width: 100, height: 100}});

            // Then it lands as a success, exactly the case the reviewer reported. The preview
            // placeholder is gone only because the full image now replaces it, with no failure and no
            // retry offered.
            expect(onError).not.toHaveBeenCalled();
            expect(onLoad).toHaveBeenCalledTimes(1);
            expect(screen.queryByTestId('retry-button')).toBeNull();
            expect(screen.queryByTestId('loading-indicator')).toBeNull();
        });
    });
});
