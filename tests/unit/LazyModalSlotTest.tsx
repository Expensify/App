// Regression coverage for lazy-modal containment and preserved error reporting.
import {act, render, screen, waitFor} from '@testing-library/react-native';

import LazyModalSlot from '@components/LazyModalSlot';
import Text from '@components/Text';

import * as Sentry from '@sentry/react-native';
import React from 'react';
import {ErrorBoundary} from 'react-error-boundary';

jest.mock('@libs/Log', () => ({alert: jest.fn()}));
jest.mock('@sentry/react-native', () => ({captureException: jest.fn()}));

beforeEach(() => jest.mocked(Sentry.captureException).mockClear());

it.each(['healthy', 'ChunkLoadError', 'Error'])('LazyModalSlot preserves the surrounding App (%s)', async (name) => {
    // Given a healthy or rejected lazy modal, failure must stay inside its slot
    const error = Object.assign(new Error('Modal failed'), {name});
    const Modal = React.lazy(() => (name === 'healthy' ? Promise.resolve({default: () => <Text>Healthy modal</Text>}) : Promise.reject(error)));
    const rootError = jest.fn();

    // When React settles the import inside the same boundary hierarchy as the App
    render(
        <ErrorBoundary
            fallback={<Text>Root failure</Text>}
            onError={rootError}
        >
            <Text>App remains available</Text>
            <LazyModalSlot>
                <Modal />
            </LazyModalSlot>
        </ErrorBoundary>,
    );
    await act(async () => {
        await Promise.resolve();
    });
    await waitFor(() => {
        if (name === 'healthy') {
            expect(screen.getByText('Healthy modal')).toBeTruthy();
            return;
        }
        expect(Sentry.captureException).toHaveBeenCalledWith(error, expect.objectContaining({tags: {context: name === 'ChunkLoadError' ? 'lazy-modal-chunk' : 'lazy-modal-render-error'}}));
    });

    // Then the surrounding App survives, healthy content loads, and reporting is preserved
    expect(rootError).not.toHaveBeenCalled();
    expect(screen.getByText('App remains available')).toBeTruthy();
    expect(screen.queryByText('Root failure')).toBeNull();
    if (name === 'healthy') {
        expect(Sentry.captureException).not.toHaveBeenCalled();
    }
    if (name === 'ChunkLoadError') {
        expect(Sentry.captureException).toHaveBeenCalledWith(error, expect.objectContaining({level: 'warning', fingerprint: ['lazy-modal-chunk-failure']}));
    }
});
