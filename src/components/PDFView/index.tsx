import React, {lazy, Suspense} from 'react';
import ErrorBoundary from '@components/ErrorBoundary';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import type {PDFViewProps} from './types';

const PDFViewImpl = lazy(() => import('./PDFViewImpl'));

function PDFView(props: PDFViewProps) {
    return (
        <ErrorBoundary errorMessage="Error loading PDFView">
            <Suspense fallback={<FullScreenLoadingIndicator />}>
                <PDFViewImpl
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                />
            </Suspense>
        </ErrorBoundary>
    );
}

export default PDFView;
