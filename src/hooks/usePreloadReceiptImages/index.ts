import {useEffect} from 'react';
import {getPreloadedBlobURLs, preloadAuthImages, revokeCachedAuthImage} from '@libs/AuthImagesPreloader';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import CONST from '@src/CONST';
import type {ReceiptSource} from '@src/types/onyx/Transaction';
import type UsePreloadReceiptImages from './types';

function prepareReceiptsToPreload(sources: Array<ReceiptSource | undefined>): string[] {
    return sources
        .map((source: ReceiptSource | undefined) => {
            if (!source) {
                return;
            }
            const uri = tryResolveUrlFromApiRoot(source);
            return typeof uri === 'string' ? uri : undefined;
        })
        .filter((uri): uri is string => !!uri);
}

/**
 * Preload receipt images for the given transactions into blob URLs
 * so that useCachedImageSource can resolve them synchronously (avoiding a loading flash on navigation).
 * Also revokes blob URLs for images that have left the prev/current/next window.
 * Full cleanup happens in clearActiveTransactionIDs when the user leaves the transaction view.
 */
const usePreloadReceiptImages: UsePreloadReceiptImages = (transactions, encryptedAuthToken) => {
    useEffect(() => {
        if (!encryptedAuthToken) {
            return;
        }

        const headers = {[CONST.CHAT_ATTACHMENT_TOKEN_KEY]: encryptedAuthToken};
        const urisToPreload: Array<ReceiptSource | undefined> = [];

        for (const transaction of transactions) {
            if (!transaction) {
                continue;
            }
            const receiptURIs = getThumbnailAndImageURIs(transaction);
            if (!receiptURIs.isLocalFile) {
                urisToPreload.push(receiptURIs.image, receiptURIs.thumbnail);
            }
        }

        const preloadedURLs = getPreloadedBlobURLs();
        const receiptsToPreload = prepareReceiptsToPreload(urisToPreload);

        // Revoke blob URLs for images that left the prev/next window
        for (const oldURI of preloadedURLs.keys()) {
            if (!receiptsToPreload.includes(oldURI)) {
                revokeCachedAuthImage(oldURI);
            }
        }

        preloadAuthImages(receiptsToPreload, headers);
    }, [transactions, encryptedAuthToken]);
};

export default usePreloadReceiptImages;
