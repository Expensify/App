import {act, render, screen} from '@testing-library/react-native';

import ConfirmationReceiptThumbnail from '@components/MoneyRequestConfirmationListFooter/ConfirmationReceiptThumbnail';

import CONST from '@src/CONST';

import type {PdfProps} from 'react-native-pdf';

import React from 'react';

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string, params?: {pageCount?: number}) => `${key}:${params?.pageCount}`),
    })),
);

jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));

// Render the real native thumbnail so the test covers how react-native-pdf delivers its events.
jest.mock('@components/PDFThumbnail', () => jest.requireActual<{default: unknown}>('@components/PDFThumbnail/index.native').default);

jest.mock('@components/LoadingIndicator', () => () => null);

jest.mock('@components/Badge', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string; children?: React.ReactNode}>>>('react-native');
    return ({text}: {text: string}) => <RN.Text testID="receipt-page-count-badge">{text}</RN.Text>;
});

type MockPdfRenderer = {
    /** The file this native renderer started loading when it mounted */
    initialURI: string | undefined;
};

// Each mounted react-native-pdf view is tracked like a native renderer: it keeps loading the file it started with,
// and when it finishes it calls whatever callback it was most recently rendered with. Unmounted views are removed.
const mockPdfRenderers = new Map<MockPdfRenderer, PdfProps>();
jest.mock('react-native-pdf', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    return function MockPdf(props: PdfProps) {
        const [renderer] = ReactModule.useState<MockPdfRenderer>(() => ({initialURI: typeof props.source === 'object' ? props.source.uri : undefined}));
        ReactModule.useEffect(() => {
            mockPdfRenderers.set(renderer, props);
        });
        ReactModule.useEffect(
            () => () => {
                mockPdfRenderers.delete(renderer);
            },
            [renderer],
        );
        return null;
    };
});

const FIRST_PDF = 'file:///first-receipt.pdf';
const SECOND_PDF = 'file:///second-receipt.pdf';

type TestProps = Partial<React.ComponentProps<typeof ConfirmationReceiptThumbnail>>;

function renderThumbnail(props: TestProps = {}) {
    const defaultProps: React.ComponentProps<typeof ConfirmationReceiptThumbnail> = {
        transactionID: '1',
        reportID: '1',
        action: CONST.IOU.ACTION.CREATE,
        iouType: CONST.IOU.TYPE.SPLIT,
        isReceiptEditable: true,
        shouldDisplayReceipt: true,
        isLoadingReceipt: false,
        isCompactMode: false,
        isLocalFile: true,
        isThumbnail: false,
        fileExtension: 'pdf',
        receiptFilename: 'receipt.pdf',
        receiptThumbnail: undefined,
        resolvedReceiptImage: FIRST_PDF,
        effectiveReceiptSource: FIRST_PDF,
        receiptPageCount: 0,
        isOdometerDistanceRequest: false,
        isDistanceRequest: false,
        isManualDistanceRequest: false,
        compactReceiptContainerStyle: undefined,
        onCompactReceiptContainerLayout: jest.fn(),
        onReceiptLoad: jest.fn(),
    };
    const result = render(
        <ConfirmationReceiptThumbnail
            {...defaultProps}
            {...props}
        />,
    );
    return {
        ...result,
        rerenderWith: (nextProps: TestProps) =>
            result.rerender(
                <ConfirmationReceiptThumbnail
                    {...defaultProps}
                    {...nextProps}
                />,
            ),
    };
}

// Simulates the native renderer that started loading `uri` finishing its load. An unmounted native view emits nothing.
function finishNativeLoad(uri: string, numberOfPages: number) {
    const rendererProps = [...mockPdfRenderers].find(([renderer]) => renderer.initialURI === uri)?.[1];
    act(() => rendererProps?.onLoadComplete?.(numberOfPages, uri, {width: 100, height: 100}));
}

describe('ConfirmationReceiptThumbnail on native', () => {
    beforeEach(() => {
        mockPdfRenderers.clear();
    });

    it('shows the page count reported by react-native-pdf for a local multi-page PDF', () => {
        // Given a local PDF on the confirmation screen, which has no server pageCount before upload
        renderThumbnail();

        // When react-native-pdf finishes loading it and reports 3 pages
        finishNativeLoad(FIRST_PDF, 3);

        // Then the badge shows the count read from the native renderer
        expect(screen.getByTestId('receipt-page-count-badge')).toHaveTextContent('receipt.pageCount:3');
    });

    it('does not badge a replacement PDF with the count of the file it replaced while that file was still loading', () => {
        // Given a 3-page local PDF that react-native-pdf has started loading but not finished
        const {rerenderWith} = renderThumbnail();

        // When the receipt is replaced with a 1-page PDF before the first file finishes
        rerenderWith({resolvedReceiptImage: SECOND_PDF, effectiveReceiptSource: SECOND_PDF});

        // And the renderer for the first file then completes, which a native view does through its current callbacks
        finishNativeLoad(FIRST_PDF, 3);

        // Then the first file's count does not badge the replacement
        expect(screen.queryByTestId('receipt-page-count-badge')).toBeNull();

        // When the replacement finishes loading as a 1-page PDF
        finishNativeLoad(SECOND_PDF, 1);

        // Then there is still no badge, because a single-page PDF has none
        expect(screen.queryByTestId('receipt-page-count-badge')).toBeNull();
    });

    it('shows the replacement PDF page count once the replacement finishes loading', () => {
        // Given a 1-page local PDF that has finished loading, so it has no badge
        const {rerenderWith} = renderThumbnail();
        finishNativeLoad(FIRST_PDF, 1);

        // When the receipt is replaced with a PDF that react-native-pdf reports as 4 pages
        rerenderWith({resolvedReceiptImage: SECOND_PDF, effectiveReceiptSource: SECOND_PDF});
        finishNativeLoad(SECOND_PDF, 4);

        // Then the badge shows the replacement's own page count
        expect(screen.getByTestId('receipt-page-count-badge')).toHaveTextContent('receipt.pageCount:4');
    });
});
