import {renderHook} from '@testing-library/react-native';
// @ts-expect-error bypass jest-expo haste resolver picking .native.ts
// eslint-disable-next-line import/extensions -- .ts extension needed to bypass jest-expo haste resolver picking .native.ts (no-op)
import usePreloadReceiptImages from '@hooks/usePreloadReceiptImages/index.ts';
import {getPreloadedBlobURLs, preloadAuthImages, revokeCachedAuthImage} from '@libs/AuthImagesPreloader';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import CONST from '@src/CONST';
import type Transaction from '@src/types/onyx/Transaction';

jest.mock('@libs/AuthImagesPreloader', () => ({
    getPreloadedBlobURLs: jest.fn(),
    preloadAuthImages: jest.fn(),
    revokeCachedAuthImage: jest.fn(),
}));

jest.mock('@libs/ReceiptUtils', () => ({
    getThumbnailAndImageURIs: jest.fn(),
}));

jest.mock('@libs/tryResolveUrlFromApiRoot', () => jest.fn((uri: string) => uri));

const mockGetPreloadedBlobURLs = getPreloadedBlobURLs as jest.Mock;
const mockPreloadAuthImages = preloadAuthImages as jest.Mock;
const mockRevokeCachedAuthImage = revokeCachedAuthImage as jest.Mock;
const mockGetThumbnailAndImageURIs = getThumbnailAndImageURIs as jest.Mock;
const mockTryResolveUrl = tryResolveUrlFromApiRoot as jest.Mock;

const AUTH_TOKEN = 'encrypted-auth-token';
const IMAGE_URI_1 = 'https://expensify.com/receipt1.png';
const IMAGE_URI_2 = 'https://expensify.com/receipt2.png';
const THUMBNAIL_URI_1 = 'https://expensify.com/receipt1_thumb.png';

const createTransaction = (overrides?: Partial<Transaction>) =>
    ({
        transactionID: 'txn-1',
        reportID: 'report-1',
        ...overrides,
    }) as Transaction;

beforeEach(() => {
    jest.clearAllMocks();
    mockGetPreloadedBlobURLs.mockReturnValue(new Map());
    mockTryResolveUrl.mockImplementation((uri: string) => uri);
});

describe('usePreloadReceiptImages', () => {
    it('should not preload when encryptedAuthToken is undefined', () => {
        renderHook(() => usePreloadReceiptImages([createTransaction()], undefined));

        expect(mockPreloadAuthImages).not.toHaveBeenCalled();
    });

    it('should preload receipt images for transactions with remote receipts', () => {
        const transaction = createTransaction();
        mockGetThumbnailAndImageURIs.mockReturnValue({
            image: IMAGE_URI_1,
            thumbnail: THUMBNAIL_URI_1,
            isLocalFile: false,
        });

        renderHook(() => usePreloadReceiptImages([transaction], AUTH_TOKEN));

        expect(mockPreloadAuthImages).toHaveBeenCalledWith([IMAGE_URI_1, THUMBNAIL_URI_1], {[CONST.CHAT_ATTACHMENT_TOKEN_KEY]: AUTH_TOKEN});
    });

    it('should skip local file receipts', () => {
        const transaction = createTransaction();
        mockGetThumbnailAndImageURIs.mockReturnValue({
            image: 'file:///local/receipt.png',
            thumbnail: 'file:///local/receipt_thumb.png',
            isLocalFile: true,
        });

        renderHook(() => usePreloadReceiptImages([transaction], AUTH_TOKEN));

        expect(mockPreloadAuthImages).toHaveBeenCalledWith([], {[CONST.CHAT_ATTACHMENT_TOKEN_KEY]: AUTH_TOKEN});
    });

    it('should skip undefined transactions', () => {
        mockGetThumbnailAndImageURIs.mockReturnValue({
            image: IMAGE_URI_1,
            isLocalFile: false,
        });

        renderHook(() => usePreloadReceiptImages([undefined, createTransaction()], AUTH_TOKEN));

        expect(mockGetThumbnailAndImageURIs).toHaveBeenCalledTimes(1);
    });

    it('should revoke blob URLs for images that left the preload window', () => {
        const oldUri = 'https://expensify.com/old-receipt.png';
        mockGetPreloadedBlobURLs.mockReturnValue(new Map([[oldUri, 'blob:old']]));

        const transaction = createTransaction();
        mockGetThumbnailAndImageURIs.mockReturnValue({
            image: IMAGE_URI_1,
            isLocalFile: false,
        });

        renderHook(() => usePreloadReceiptImages([transaction], AUTH_TOKEN));

        expect(mockRevokeCachedAuthImage).toHaveBeenCalledWith(oldUri);
    });

    it('should not revoke blob URLs that are still in the preload window', () => {
        mockGetPreloadedBlobURLs.mockReturnValue(new Map([[IMAGE_URI_1, 'blob:current']]));

        const transaction = createTransaction();
        mockGetThumbnailAndImageURIs.mockReturnValue({
            image: IMAGE_URI_1,
            isLocalFile: false,
        });

        renderHook(() => usePreloadReceiptImages([transaction], AUTH_TOKEN));

        expect(mockRevokeCachedAuthImage).not.toHaveBeenCalled();
    });

    it('should preload images for multiple transactions', () => {
        const transaction1 = createTransaction({transactionID: 'txn-1'});
        const transaction2 = createTransaction({transactionID: 'txn-2'});

        mockGetThumbnailAndImageURIs.mockReturnValueOnce({image: IMAGE_URI_1, thumbnail: THUMBNAIL_URI_1, isLocalFile: false}).mockReturnValueOnce({image: IMAGE_URI_2, isLocalFile: false});

        renderHook(() => usePreloadReceiptImages([transaction1, transaction2], AUTH_TOKEN));

        expect(mockPreloadAuthImages).toHaveBeenCalledWith([IMAGE_URI_1, THUMBNAIL_URI_1, IMAGE_URI_2], {[CONST.CHAT_ATTACHMENT_TOKEN_KEY]: AUTH_TOKEN});
    });

    it('should filter out undefined image/thumbnail URIs', () => {
        const transaction = createTransaction();
        mockGetThumbnailAndImageURIs.mockReturnValue({
            image: IMAGE_URI_1,
            thumbnail: undefined,
            isLocalFile: false,
        });

        renderHook(() => usePreloadReceiptImages([transaction], AUTH_TOKEN));

        expect(mockPreloadAuthImages).toHaveBeenCalledWith([IMAGE_URI_1], {[CONST.CHAT_ATTACHMENT_TOKEN_KEY]: AUTH_TOKEN});
    });

    it('should filter out non-string URIs from tryResolveUrlFromApiRoot', () => {
        const transaction = createTransaction();
        mockGetThumbnailAndImageURIs.mockReturnValue({
            image: IMAGE_URI_1,
            isLocalFile: false,
        });
        mockTryResolveUrl.mockReturnValue(123);

        renderHook(() => usePreloadReceiptImages([transaction], AUTH_TOKEN));

        expect(mockPreloadAuthImages).toHaveBeenCalledWith([], {[CONST.CHAT_ATTACHMENT_TOKEN_KEY]: AUTH_TOKEN});
    });
});
