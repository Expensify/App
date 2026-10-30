import {act, render, screen} from '@testing-library/react-native';

import type ReceiptPDFOverlayProps from '@components/ReportActionItem/ReceiptPDFOverlay/types';

import CONST from '@src/CONST';

import type {ComponentType, ReactNode} from 'react';

import React from 'react';

type MockThumbnailProps = {pageNumber: number; width: number; onRenderSuccess?: () => void; onRenderError?: () => void};

const mockPDFPreviewer = jest.fn(() => null);
const mockRenderedThumbnails: MockThumbnailProps[] = [];

jest.mock('react-fast-pdf', () => ({
    PDFPreviewer: () => mockPDFPreviewer(),
}));

jest.mock('@components/PDFThumbnail', () => {
    const {useEffect} = jest.requireActual<typeof React>('react');
    const {Text: MockText} = jest.requireActual<{Text: ComponentType<{children: ReactNode}>}>('react-native');
    function MockDocument({children, onLoadSuccess}: {children: ReactNode; onLoadSuccess?: () => void}) {
        useEffect(() => {
            onLoadSuccess?.();
            // Report once, like a document that finished loading
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);
        return children;
    }
    function MockThumbnail({pageNumber, width, onRenderSuccess, onRenderError}: MockThumbnailProps) {
        mockRenderedThumbnails.push({pageNumber, width, onRenderSuccess, onRenderError});
        return <MockText>{`page-${pageNumber}`}</MockText>;
    }
    return {Document: MockDocument, Thumbnail: MockThumbnail};
});

jest.mock('@userActions/CanvasSize', () => ({
    retrieveMaxCanvasArea: jest.fn(),
    retrieveMaxCanvasHeight: jest.fn(),
    retrieveMaxCanvasWidth: jest.fn(),
}));

// jest-expo resolves the native variant first, and this test covers the web implementation
const {default: ReceiptPDFOverlay} = jest.requireActual<{default: ComponentType<ReceiptPDFOverlayProps>}>('@components/ReportActionItem/ReceiptPDFOverlay/index.tsx');

const SOURCE_URL = 'https://example.com/receipt.pdf';
const OVERSAMPLE_WIDTH = 500;

// Like the browser's, reports the observed element's size as soon as observing starts
class MockResizeObserver {
    private readonly callback: (entries: Array<{contentRect: {width: number}}>) => void;

    constructor(callback: (entries: Array<{contentRect: {width: number}}>) => void) {
        this.callback = callback;
    }

    observe() {
        this.callback([{contentRect: {width: OVERSAMPLE_WIDTH}}]);
    }

    disconnect() {}
}

function renderOverlay(props: Omit<ReceiptPDFOverlayProps, 'sourceURL'>) {
    // createNodeMock gives the container's ref a node to observe, as the DOM would
    return render(
        <ReceiptPDFOverlay
            sourceURL={SOURCE_URL}
            isAuthTokenRequired={false}
            {...props}
        />,
        {createNodeMock: () => ({})},
    );
}

describe('ReceiptPDFOverlay', () => {
    beforeAll(() => {
        Object.defineProperty(global, 'ResizeObserver', {value: MockResizeObserver, writable: true});
    });

    beforeEach(() => {
        mockPDFPreviewer.mockClear();
        mockRenderedThumbnails.length = 0;
    });

    it('keeps rendering the full PDFPreviewer when no page is requested', () => {
        // Given a receipt whose preview has no page navigation (e.g. a single-page PDF, or a device without hover support)
        // When the overlay renders with no `page` prop
        renderOverlay({});

        // Then it falls back to the full multi-page PDFPreviewer instead of rendering a single page
        expect(mockPDFPreviewer).toHaveBeenCalled();
        expect(screen.queryByText('page-1')).toBeNull();
    });

    it('renders only the requested page, sized like PDFPreviewer, and reports the load', () => {
        // Given a multi-page receipt with page navigation on
        const onLoadSuccess = jest.fn();

        // When the overlay renders with a page requested
        renderOverlay({page: 1, onLoadSuccess});

        // Then it draws only that page (not the full PDFPreviewer, which would measure every page first), sized to
        // match PDFPreviewer's framing, and tells the caller the PDF is ready so the pill's buttons can enable
        expect(mockPDFPreviewer).not.toHaveBeenCalled();
        expect(screen.getByText('page-1')).toBeTruthy();
        expect(onLoadSuccess).toHaveBeenCalledTimes(1);
        expect(mockRenderedThumbnails.at(-1)?.width).toBe(OVERSAMPLE_WIDTH + CONST.RECEIPT.PDF_PAGE_BORDER * 2);
    });

    it('keeps the previous page on screen until the next one has rendered', () => {
        // Given page 1 is already drawn
        const {rerender} = renderOverlay({page: 1});

        // When the user clicks next, before page 2 has finished drawing
        rerender(
            <ReceiptPDFOverlay
                sourceURL={SOURCE_URL}
                isAuthTokenRequired={false}
                page={2}
            />,
        );

        // Then page 1 stays on screen alongside page 2, so the thumbnail underneath never flashes through
        expect(screen.getByText('page-1')).toBeTruthy();
        expect(screen.getByText('page-2')).toBeTruthy();

        act(() => {
            mockRenderedThumbnails.findLast((thumbnail) => thumbnail.pageNumber === 2)?.onRenderSuccess?.();
        });

        // Then, once page 2 finishes drawing, page 1 is dropped
        expect(screen.queryByText('page-1')).toBeNull();
        expect(screen.getByText('page-2')).toBeTruthy();
    });

    it('does not carry the last drawn page over to a replaced receipt', () => {
        // Given the user is on page 2 of one receipt
        const {rerender} = renderOverlay({page: 2});

        // When that receipt is replaced by a different file (a new source URL) showing its own page 1
        rerender(
            <ReceiptPDFOverlay
                sourceURL="https://example.com/replaced-receipt.pdf"
                isAuthTokenRequired={false}
                page={1}
            />,
        );

        // Then page 2 of the old file is not left on screen under the new file's page 1
        expect(screen.queryByText('page-2')).toBeNull();
        expect(screen.getByText('page-1')).toBeTruthy();
    });

    it('falls back to the thumbnail when a page fails to render', () => {
        // Given a page is being drawn
        const onLoadFailure = jest.fn();
        renderOverlay({page: 1, onLoadFailure});

        // When that page fails to render (e.g. a corrupt page), rather than erroring silently
        act(() => {
            mockRenderedThumbnails.at(-1)?.onRenderError?.();
        });

        // Then the overlay removes itself and tells the caller, so the static thumbnail underneath shows instead
        expect(screen.queryByText('page-1')).toBeNull();
        expect(onLoadFailure).toHaveBeenCalledTimes(1);
    });

    it('loads the page when navigation switches on after mount, without any hover or layout event', () => {
        // Given the overlay mounted before page navigation turned on (it only turns on after the receipt loads)
        const {rerender} = renderOverlay({});

        // When page navigation switches on later, with no further hover or layout event to prompt a measurement
        rerender(
            <ReceiptPDFOverlay
                sourceURL={SOURCE_URL}
                isAuthTokenRequired={false}
                page={1}
            />,
        );

        // Then the page still loads, because the width is measured by a ResizeObserver, not a layout event
        expect(screen.getByText('page-1')).toBeTruthy();
    });
});
