import {act, render, screen} from '@testing-library/react-native';

import type ReceiptPDFOverlayProps from '@components/ReportActionItem/ReceiptPDFOverlay/types';

import type {ComponentType, ReactNode} from 'react';

import React from 'react';

type MockThumbnailProps = {pageNumber: number; width: number; onRenderSuccess?: () => void};

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
    function MockThumbnail({pageNumber, width, onRenderSuccess}: MockThumbnailProps) {
        mockRenderedThumbnails.push({pageNumber, width, onRenderSuccess});
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
const {default: ReceiptPDFOverlay, PDF_PAGE_BORDER} = jest.requireActual<{default: ComponentType<ReceiptPDFOverlayProps>; PDF_PAGE_BORDER: number}>(
    '@components/ReportActionItem/ReceiptPDFOverlay/index.tsx',
);

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
        renderOverlay({});

        expect(mockPDFPreviewer).toHaveBeenCalled();
        expect(screen.queryByText('page-1')).toBeNull();
    });

    it('renders only the requested page, sized like PDFPreviewer, and reports the load', () => {
        const onLoadSuccess = jest.fn();
        renderOverlay({page: 1, onLoadSuccess});

        expect(mockPDFPreviewer).not.toHaveBeenCalled();
        expect(screen.getByText('page-1')).toBeTruthy();
        expect(onLoadSuccess).toHaveBeenCalledTimes(1);
        expect(mockRenderedThumbnails.at(-1)?.width).toBe(OVERSAMPLE_WIDTH + PDF_PAGE_BORDER * 2);
    });

    it('keeps the previous page on screen until the next one has rendered', () => {
        const {rerender} = renderOverlay({page: 1});

        rerender(
            <ReceiptPDFOverlay
                sourceURL={SOURCE_URL}
                isAuthTokenRequired={false}
                page={2}
            />,
        );

        expect(screen.getByText('page-1')).toBeTruthy();
        expect(screen.getByText('page-2')).toBeTruthy();

        act(() => {
            mockRenderedThumbnails.findLast((thumbnail) => thumbnail.pageNumber === 2)?.onRenderSuccess?.();
        });

        expect(screen.queryByText('page-1')).toBeNull();
        expect(screen.getByText('page-2')).toBeTruthy();
    });

    it('does not carry the last drawn page over to a replaced receipt', () => {
        const {rerender} = renderOverlay({page: 2});

        rerender(
            <ReceiptPDFOverlay
                sourceURL="https://example.com/replaced-receipt.pdf"
                isAuthTokenRequired={false}
                page={1}
            />,
        );

        expect(screen.queryByText('page-2')).toBeNull();
        expect(screen.getByText('page-1')).toBeTruthy();
    });

    // Page navigation switches on after the receipt loads, so the overlay first mounts without a page
    it('loads the page when navigation switches on after mount, without any hover or layout event', () => {
        const {rerender} = renderOverlay({});

        rerender(
            <ReceiptPDFOverlay
                sourceURL={SOURCE_URL}
                isAuthTokenRequired={false}
                page={1}
            />,
        );

        expect(screen.getByText('page-1')).toBeTruthy();
    });
});
