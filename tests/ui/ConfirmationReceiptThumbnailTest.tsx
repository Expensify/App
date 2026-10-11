import {act, render, screen} from '@testing-library/react-native';

import ConfirmationReceiptThumbnail from '@components/MoneyRequestConfirmationListFooter/ConfirmationReceiptThumbnail';
import type PDFThumbnailProps from '@components/PDFThumbnail/types';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string, params?: {pageCount?: number}) => `${key}:${params?.pageCount}`),
    })),
);

jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));

// Capture the callbacks of every PDFThumbnail render so the test can simulate the renderer finishing a load.
let latestPDFThumbnailProps: PDFThumbnailProps | undefined;
jest.mock('@components/PDFThumbnail', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string}>>>('react-native');
    return (props: PDFThumbnailProps) => {
        latestPDFThumbnailProps = props;
        return <RN.View testID="pdf-thumbnail" />;
    };
});

jest.mock('@components/Badge', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string; children?: React.ReactNode}>>>('react-native');
    return ({text}: {text: string}) => <RN.Text testID="receipt-page-count-badge">{text}</RN.Text>;
});

const FIRST_PDF = 'blob:first-receipt';
const SECOND_PDF = 'blob:second-receipt';

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
        isMapDistanceRequest: false,
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

function loadPDF(pageCount?: number) {
    const onLoadSuccess = latestPDFThumbnailProps?.onLoadSuccess;
    act(() => onLoadSuccess?.(pageCount));
}

describe('ConfirmationReceiptThumbnail', () => {
    beforeEach(() => {
        latestPDFThumbnailProps = undefined;
    });

    it('shows the page count badge for a local multi-page PDF that has no server page count yet', () => {
        // Given a local PDF on the confirmation screen, which has not been uploaded so it has no server pageCount
        renderThumbnail();

        // When the renderer reports that the document has 3 pages
        loadPDF(3);

        // Then the badge shows the page count read from the rendered PDF
        expect(screen.getByTestId('receipt-page-count-badge')).toHaveTextContent('receipt.pageCount:3');
    });

    it('drops the detected count when the receipt is replaced with a single-page PDF', () => {
        // Given a 3-page local PDF whose badge is showing
        const {rerenderWith} = renderThumbnail();
        loadPDF(3);

        // When the receipt is replaced with a different file that turns out to have 1 page
        rerenderWith({resolvedReceiptImage: SECOND_PDF, effectiveReceiptSource: SECOND_PDF});
        loadPDF(1);

        // Then the old count does not carry over to the new file, so no badge shows
        expect(screen.queryByTestId('receipt-page-count-badge')).toBeNull();
    });

    it('ignores a load that resolves for the previous receipt after it was replaced', () => {
        // Given a local PDF whose load callback is captured before it resolves
        const {rerenderWith} = renderThumbnail();
        const staleOnLoadSuccess = latestPDFThumbnailProps?.onLoadSuccess;

        // When the receipt is replaced and only then does the old file finish loading
        rerenderWith({resolvedReceiptImage: SECOND_PDF, effectiveReceiptSource: SECOND_PDF});
        act(() => staleOnLoadSuccess?.(3));

        // Then the old file's count is not used to badge the new file
        expect(screen.queryByTestId('receipt-page-count-badge')).toBeNull();
    });

    it('drops the detected count when stitching replaces the receipt with the same PDF URI', () => {
        // Given a 3-page local PDF whose badge is showing
        const {rerenderWith} = renderThumbnail();
        loadPDF(3);

        // When the receipt is stitched and the replacement reuses the same URI, so the source-change reset does not run
        rerenderWith({isLoadingReceipt: true});
        rerenderWith({isLoadingReceipt: false});

        // Then the old count is gone until the replacement finishes loading
        expect(screen.queryByTestId('receipt-page-count-badge')).toBeNull();

        // When the stitched replacement loads and turns out to have 1 page
        loadPDF(1);

        // Then the old count still does not badge the stitched file
        expect(screen.queryByTestId('receipt-page-count-badge')).toBeNull();
    });

    it('hides the badge when the PDF fails to load', () => {
        // Given a 3-page local PDF whose badge is showing
        renderThumbnail();
        loadPDF(3);

        // When the PDF then reports a load error
        const onLoadError = latestPDFThumbnailProps?.onLoadError;
        act(() => onLoadError?.());

        // Then the badge is removed instead of keeping the last good count
        expect(screen.queryByTestId('receipt-page-count-badge')).toBeNull();
    });

    it('prefers the server page count over the one detected locally', () => {
        // Given a receipt that the server has already reported as 5 pages
        renderThumbnail({receiptPageCount: 5});

        // When the local renderer reports a different count
        loadPDF(2);

        // Then the server value wins because it describes the uploaded file
        expect(screen.getByTestId('receipt-page-count-badge')).toHaveTextContent('receipt.pageCount:5');
    });
});
