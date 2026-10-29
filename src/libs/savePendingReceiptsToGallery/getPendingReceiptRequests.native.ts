import {isLocalFile} from '@libs/fileDownload/FileUtils';
import {isRecord} from '@libs/ObjectUtils';
import {RECEIPT_BEARING_COMMANDS} from '@libs/telemetry/ReceiptObservability';

import {getAll, getOngoingRequest} from '@userActions/PersistedRequests';

import type {PendingReceipt} from './types';

function toPendingReceipt(receipt: unknown): PendingReceipt | undefined {
    if (!isRecord(receipt)) {
        return undefined;
    }

    const getString = (key: string): string | undefined => (typeof receipt[key] === 'string' ? receipt[key] : undefined);

    // `REPLACE_RECEIPT` queues the raw File object, which stores its local path under `uri` rather than `source`.
    const localPath = getString('localSource') ?? getString('source') ?? getString('uri');
    if (localPath === undefined || !isLocalFile(localPath)) {
        return undefined;
    }

    return {localPath, filename: getString('filename') ?? getString('name'), type: getString('type')};
}

/** Pure and synchronous so the observability snapshot can share it. Skips non-receipt and already-uploaded (remote-source) requests. */
function getPendingReceiptRequests(): PendingReceipt[] {
    const ongoingRequest = getOngoingRequest();
    const requests = [...(ongoingRequest ? [ongoingRequest] : []), ...getAll()];

    return requests.reduce<PendingReceipt[]>((pendingReceipts, request) => {
        if (!RECEIPT_BEARING_COMMANDS.has(request.command)) {
            return pendingReceipts;
        }

        const pendingReceipt = toPendingReceipt(request.data?.receipt);
        if (pendingReceipt) {
            pendingReceipts.push(pendingReceipt);
        }
        return pendingReceipts;
    }, []);
}

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'heic', 'heif', 'tif', 'tiff', 'webp', 'bmp']);

function isImageReceipt({type, filename, localPath}: PendingReceipt): boolean {
    if (type && type.toLowerCase().startsWith('image/')) {
        return true;
    }
    const extension = (filename ?? localPath).split('.').pop()?.toLowerCase();
    return extension !== undefined && IMAGE_EXTENSIONS.has(extension);
}

/** Native gallery APIs (`CameraRoll.saveAsset`, Android's MediaStore image collection) accept only image/video assets. Non-image receipt formats permitted by `CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS` (PDF, DOC, HTML, ZIP, ...) would silently fail; filtering them out here keeps the sign-out modal from promising a save it can't deliver. Those receipts fall under the general offline-data-loss warning. */
function getSaveablePendingReceiptRequests(): PendingReceipt[] {
    return getPendingReceiptRequests().filter(isImageReceipt);
}

export default getPendingReceiptRequests;
export {getSaveablePendingReceiptRequests};
