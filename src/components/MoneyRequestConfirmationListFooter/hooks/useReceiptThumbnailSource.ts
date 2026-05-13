import {useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalReceiptThumbnail from '@hooks/useLocalReceiptThumbnail';
import type {ThumbnailAndImageURI} from '@libs/ReceiptUtils';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import type * as OnyxTypes from '@src/types/onyx';

type UseReceiptThumbnailSourceParams = {
    /** Transaction the receipt belongs to */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Path of the receipt file (URL or filesystem path) */
    receiptPath: string | number;

    /** Filename of the receipt; required alongside `receiptPath` to compute URIs */
    receiptFilename: string;
};

function useReceiptThumbnailSource({transaction, receiptPath, receiptFilename}: UseReceiptThumbnailSourceParams) {
    const {
        image: receiptImage,
        thumbnail: receiptThumbnail,
        isThumbnail,
        fileExtension,
        isLocalFile,
    } = receiptPath && receiptFilename ? getThumbnailAndImageURIs(transaction, receiptPath, receiptFilename) : ({} as ThumbnailAndImageURI);

    const resolvedThumbnail = isLocalFile ? receiptThumbnail : tryResolveUrlFromApiRoot(receiptThumbnail ?? '');
    const resolvedReceiptImage = isLocalFile ? receiptImage : tryResolveUrlFromApiRoot(receiptImage ?? '');

    const {thumbnailUri} = useLocalReceiptThumbnail(resolvedReceiptImage as string, !!isLocalFile);

    // Capture the thumbnail source on first render (or when the underlying image changes) to
    // avoid a visible source swap (flash) when the thumbnail arrives late for local files.
    // We use the React-recommended "store information from previous renders" pattern (useState +
    // conditional setState during render) because React Compiler forbids reading refs during render
    // (react-hooks/refs). React handles this synchronously before painting, so there is no visible
    // double-render or layout thrash.
    const resolvedReceiptImageStr = resolvedReceiptImage != null ? String(resolvedReceiptImage) : undefined;
    const [initialLocalSource, setInitialLocalSource] = useState<{source: string | undefined; resolvedImage: string | undefined}>({source: undefined, resolvedImage: undefined});
    if (isLocalFile && (initialLocalSource.source === undefined || initialLocalSource.resolvedImage !== resolvedReceiptImageStr)) {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- empty string fallback is intentional: we want to skip the empty-string case in the OR chain, not treat it as a valid source
        setInitialLocalSource({source: thumbnailUri || resolvedReceiptImageStr || '', resolvedImage: resolvedReceiptImageStr});
    }

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- empty string fallback is intentional: we want to skip the empty-string case in the OR chain, not treat it as a valid source
    const effectiveReceiptSource = isLocalFile ? initialLocalSource.source || '' : resolvedThumbnail || resolvedReceiptImage || '';

    const hasReceiptImageOrThumbnail = !!(receiptImage ?? receiptThumbnail);

    return {
        receiptImage,
        receiptThumbnail,
        isThumbnail,
        fileExtension,
        isLocalFile,
        resolvedThumbnail,
        resolvedReceiptImage,
        effectiveReceiptSource,
        hasReceiptImageOrThumbnail,
    };
}

export default useReceiptThumbnailSource;
