import {act, renderHook} from '@testing-library/react-native';

import useLocalReceiptThumbnail, {precacheReceiptImage} from '@hooks/useLocalReceiptThumbnail';

import {finish, recordUpgrade, start} from '@libs/ReceiptStorage/receiptUpgrades';

const mockGenerateThumbnail = jest.fn<Promise<string | null>, [string]>();
jest.mock('@pages/iou/request/step/IOURequestStepScan/cropImageToAspectRatio', () => ({
    generateThumbnail: (sourceUri: string) => mockGenerateThumbnail(sourceUri),
}));

const FOLDER = 'file:///var/mobile/Containers/Data/Application/AAAA/Documents/Receipts-Upload';

/** Each test uses its own receipt, since the thumbnail cache outlives a single hook. */
function buildReceipt(name: string) {
    return {name, uri: `${FOLDER}/${name}`};
}

function upgradeReceipt(name: string) {
    act(() => {
        start(name);
        recordUpgrade(name);
        finish(name);
    });
}

describe('useLocalReceiptThumbnail', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGenerateThumbnail.mockResolvedValue(null);
    });

    it('hands back the seeded receipt untouched while nothing has replaced it', () => {
        const {uri} = buildReceipt('receipt_untouched.jpg');
        precacheReceiptImage(uri);

        const {result} = renderHook(() => useLocalReceiptThumbnail(uri, true));

        expect(result.current.thumbnailUri).toBe(uri);
        expect(result.current.isGenerating).toBe(false);
    });

    it('gives the same file a source the image loaders treat as new once a better capture replaces it', () => {
        const {name, uri} = buildReceipt('receipt_replaced.jpg');
        precacheReceiptImage(uri);

        const {result} = renderHook(() => useLocalReceiptThumbnail(uri, true));
        expect(result.current.thumbnailUri).toBe(uri);

        upgradeReceipt(name);

        // The path never changes, so without this the loader would serve the decode it already had.
        expect(result.current.thumbnailUri).toBe(`${uri}#upgraded1`);
    });

    it('moves the marker on rather than stacking it when the same receipt is replaced twice', () => {
        const {name, uri} = buildReceipt('receipt_replaced_twice.jpg');
        precacheReceiptImage(uri);

        const {result} = renderHook(() => useLocalReceiptThumbnail(uri, true));

        upgradeReceipt(name);
        expect(result.current.thumbnailUri).toBe(`${uri}#upgraded1`);

        upgradeReceipt(name);
        // One marker, not two, so the source stays a path the loader can still open.
        expect(result.current.thumbnailUri).toBe(`${uri}#upgraded2`);
    });

    it('leaves a receipt that only finished an upgrade alone, since its bytes never moved', () => {
        const {name, uri} = buildReceipt('receipt_still_the_snapshot.jpg');
        precacheReceiptImage(uri);

        const {result} = renderHook(() => useLocalReceiptThumbnail(uri, true));

        act(() => {
            start(name);
            finish(name);
        });

        expect(result.current.thumbnailUri).toBe(uri);
    });
});
