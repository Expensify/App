/**
 * Moves a file made from a picked receipt (HEIC/DNG conversion, resize) out of the ImageManipulator cache, which the OS
 * can clear before a queued upload reads it, and into the receipts folder the picked file is already in.
 */
import Log from '@libs/Log';
import {getPickerCaptureSource, logReceiptAdoptFailed} from '@libs/telemetry/ReceiptObservability';
import type {ReceiptDerivingStep} from '@libs/telemetry/ReceiptObservability';

import type {FileObject} from '@src/types/utils/Attachment';

import ReceiptStorage from '.';
import {isInDurableFolder} from './durableFolder';

async function adoptDerivedFile(input: FileObject, output: FileObject, step: ReceiptDerivingStep): Promise<FileObject> {
    // Only follow files the picker already kept. Web files and drops stay where they are.
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

    // Safe to delete: nothing in Onyx points at the input until validation hands the files on.
    try {
        await ReceiptStorage.discard(input.uri ?? '');
    } catch (error) {
        Log.warn('[ReceiptStorage] could not delete a receipt replaced by its converted or resized copy', {error: error instanceof Error ? error.message : String(error)});
    }

    // prepareRequestPayload reads `source` on an offline replay, so it must point into the receipts folder too.
    return {...output, uri: durableUri, source: durableUri};
}

export default adoptDerivedFile;
