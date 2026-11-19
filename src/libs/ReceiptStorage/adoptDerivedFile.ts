/**
 * Keeps a file made from a picked receipt (a HEIC or DNG conversion, a resize) as durable as the file it was made from.
 * The native picker moves every pick into the receipts folder, but ImageManipulator writes its results into the app
 * cache, which the OS can clear before a queued upload reads the file.
 */
import Log from '@libs/Log';
import {getPickerCaptureSource, logReceiptAdoptFailed} from '@libs/telemetry/ReceiptObservability';
import type {ReceiptDerivingStep} from '@libs/telemetry/ReceiptObservability';

import type {FileObject} from '@src/types/utils/Attachment';

import ReceiptStorage from '.';
import {isInDurableFolder} from './durableFolder';

/**
 * Moves `output` into the receipts folder when `input` is there, and deletes `input`, which `output` replaces.
 * Resolves with `output` unchanged when there is nothing to adopt or adopting fails, so validation never blocks on it.
 */
async function adoptDerivedFile(input: FileObject, output: FileObject, step: ReceiptDerivingStep): Promise<FileObject> {
    // The step wrote nothing new when it had nothing to do. A file that was never in the receipts folder (any file on
    // web, a drop, a file that skipped the native picker) stays where it is, so this never widens what gets kept.
    if (!output.uri || output.uri === input.uri || !isInDurableFolder(input.uri)) {
        return output;
    }

    let durableUri: string;
    try {
        const durableName = await ReceiptStorage.adopt(output.uri, output.name);
        durableUri = ReceiptStorage.toLocalUri(durableName);
    } catch (error) {
        logReceiptAdoptFailed({error, captureSource: getPickerCaptureSource(), step});
        return output;
    }

    // Nothing in Onyx points at the input yet because validation has not handed the files on, so deleting it only
    // removes a copy that would otherwise stay in the receipts folder for good.
    try {
        await ReceiptStorage.discard(input.uri ?? '');
    } catch (error) {
        Log.warn('[ReceiptStorage] could not delete a receipt replaced by its converted or resized copy', {error: error instanceof Error ? error.message : String(error)});
    }

    // `source` is what prepareRequestPayload re-reads on an offline replay, so it has to point into the receipts folder too.
    return {...output, uri: durableUri, source: durableUri};
}

export default adoptDerivedFile;
