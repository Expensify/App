/**
 * Cover/reveal contract of the local receipt thumbnail cache once the Home tab sits under `ScreenActivityWrapper`.
 *
 * Home reaches `useLocalReceiptThumbnail` through the recently added rows, where a not yet uploaded receipt shows a
 * locally generated thumbnail. The hook refcounts a module level cache entry per source URI and releases it in an
 * effect cleanup, so a cover drops the entry of a row that is still mounted and painted. This suite pins that a cover
 * and a reveal change nothing the user can see: the same URI stays on screen and no thumbnail is generated a second
 * time, while a real unmount of the last consumer still frees the entry.
 */
import {screen} from '@testing-library/react-native';

import useLocalReceiptThumbnail, {precacheReceiptImage} from '@hooks/useLocalReceiptThumbnail';

import {generateThumbnail} from '@pages/iou/request/step/IOURequestStepScan/cropImageToAspectRatio';

import React from 'react';
import {View} from 'react-native';

import renderScreenWithCover from '../../utils/ScreenCoverHarness';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@pages/iou/request/step/IOURequestStepScan/cropImageToAspectRatio', () => ({
    generateThumbnail: jest.fn(),
}));

const mockedGenerateThumbnail = jest.mocked(generateThumbnail);

const NO_THUMBNAIL = 'no-thumbnail';

type ReceiptThumbnailProbeProps = {
    /** The local file the row shows a thumbnail for. */
    sourceUri: string;

    /** Distinguishes the probes of a test that mounts two consumers of the same URI. */
    testID?: string;
};

/** Stands in for a receipt cell: the URI the hook hands it goes into a testID, so a source swap changes what is on screen. */
function ReceiptThumbnailProbe({sourceUri, testID = 'receipt-thumbnail'}: ReceiptThumbnailProbeProps) {
    const {thumbnailUri, isGenerating} = useLocalReceiptThumbnail(sourceUri, true);

    return (
        <>
            <View testID={`${testID}:${thumbnailUri ?? NO_THUMBNAIL}`} />
            <View testID={isGenerating ? `${testID}-generating` : `${testID}-idle`} />
        </>
    );
}

describe('useLocalReceiptThumbnail under a screen cover', () => {
    beforeEach(() => {
        mockedGenerateThumbnail.mockReset();
    });

    it('keeps the generated thumbnail across a hide and a reveal, without generating it again', async () => {
        const sourceUri = 'file://generated-receipt.jpg';
        mockedGenerateThumbnail.mockResolvedValueOnce('file://thumbnail-1.jpg').mockResolvedValue('file://thumbnail-2.jpg');
        const home = renderScreenWithCover(<ReceiptThumbnailProbe sourceUri={sourceUri} />);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('receipt-thumbnail:file://thumbnail-1.jpg')).toBeOnTheScreen();
        expect(mockedGenerateThumbnail).toHaveBeenCalledTimes(1);

        await home.hide();
        await home.reveal();

        expect(screen.getByTestId('receipt-thumbnail:file://thumbnail-1.jpg')).toBeOnTheScreen();
        expect(screen.getByTestId('receipt-thumbnail-idle')).toBeOnTheScreen();
        expect(mockedGenerateThumbnail).toHaveBeenCalledTimes(1);
    });

    it('keeps a pre-cached receipt image across a hide and a reveal, so the fallback never generates one', async () => {
        const sourceUri = 'file://pre-cached-receipt.jpg';
        precacheReceiptImage(sourceUri);
        const home = renderScreenWithCover(<ReceiptThumbnailProbe sourceUri={sourceUri} />);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId(`receipt-thumbnail:${sourceUri}`)).toBeOnTheScreen();

        await home.hide();
        await home.reveal();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId(`receipt-thumbnail:${sourceUri}`)).toBeOnTheScreen();
        expect(screen.getByTestId('receipt-thumbnail-idle')).toBeOnTheScreen();
        expect(mockedGenerateThumbnail).not.toHaveBeenCalled();
    });

    it('shows the pre-cached image on the very first frame, which is the confirm screen fast path', () => {
        const sourceUri = 'file://fast-path-receipt.jpg';
        precacheReceiptImage(sourceUri);
        renderScreenWithCover(<ReceiptThumbnailProbe sourceUri={sourceUri} />);

        expect(screen.getByTestId(`receipt-thumbnail:${sourceUri}`)).toBeOnTheScreen();
        expect(screen.getByTestId('receipt-thumbnail-idle')).toBeOnTheScreen();
    });

    it('frees the entry when the last consumer really unmounts, so a fresh mount generates again', async () => {
        const sourceUri = 'file://unmounted-receipt.jpg';
        mockedGenerateThumbnail.mockResolvedValue('file://thumbnail-1.jpg');
        const home = renderScreenWithCover(<ReceiptThumbnailProbe sourceUri={sourceUri} />);
        await waitForBatchedUpdatesWithAct();
        home.unmount();

        renderScreenWithCover(<ReceiptThumbnailProbe sourceUri={sourceUri} />);
        await waitForBatchedUpdatesWithAct();

        expect(mockedGenerateThumbnail).toHaveBeenCalledTimes(2);
        expect(screen.getByTestId('receipt-thumbnail:file://thumbnail-1.jpg')).toBeOnTheScreen();
    });

    it('leaves two consumers of the same URI untouched by a cover and still frees the entry after both unmount', async () => {
        const sourceUri = 'file://shared-receipt.jpg';
        mockedGenerateThumbnail.mockResolvedValue('file://thumbnail-1.jpg');
        const home = renderScreenWithCover(
            <>
                <ReceiptThumbnailProbe
                    sourceUri={sourceUri}
                    testID="receipt-thumbnail-first"
                />
                <ReceiptThumbnailProbe
                    sourceUri={sourceUri}
                    testID="receipt-thumbnail-second"
                />
            </>,
        );
        await waitForBatchedUpdatesWithAct();
        const generateCallsAtMount = mockedGenerateThumbnail.mock.calls.length;

        await home.hide();
        await home.reveal();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('receipt-thumbnail-first:file://thumbnail-1.jpg')).toBeOnTheScreen();
        expect(screen.getByTestId('receipt-thumbnail-second:file://thumbnail-1.jpg')).toBeOnTheScreen();
        expect(mockedGenerateThumbnail).toHaveBeenCalledTimes(generateCallsAtMount);

        // The cover must leave the refcount at two, otherwise the entry outlives both consumers and the fresh mount below finds it.
        home.unmount();
        renderScreenWithCover(<ReceiptThumbnailProbe sourceUri={sourceUri} />);
        await waitForBatchedUpdatesWithAct();

        expect(mockedGenerateThumbnail).toHaveBeenCalledTimes(generateCallsAtMount + 1);
    });
});
