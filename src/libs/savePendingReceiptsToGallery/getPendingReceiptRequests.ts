import {WRITE_COMMANDS} from '@libs/API/types';
import {isLocalFile} from '@libs/fileDownload/FileUtils';
import {getAll, getOngoingRequest} from '@userActions/PersistedRequests';
import type {PendingReceipt} from './types';

const RECEIPT_BEARING_COMMANDS = new Set<string>([
    WRITE_COMMANDS.REQUEST_MONEY,
    WRITE_COMMANDS.TRACK_EXPENSE,
    WRITE_COMMANDS.SPLIT_BILL,
    WRITE_COMMANDS.SPLIT_BILL_AND_OPEN_REPORT,
    WRITE_COMMANDS.START_SPLIT_BILL,
    WRITE_COMMANDS.REPLACE_RECEIPT,
]);

function toPendingReceipt(receipt: unknown): PendingReceipt | undefined {
    if (typeof receipt !== 'object' || receipt === null) {
        return undefined;
    }

    const localSource = 'localSource' in receipt && typeof receipt.localSource === 'string' ? receipt.localSource : undefined;
    const source = 'source' in receipt && typeof receipt.source === 'string' ? receipt.source : undefined;
    const localPath = localSource ?? source;
    if (localPath === undefined || !isLocalFile(localPath)) {
        return undefined;
    }

    const filename = 'filename' in receipt && typeof receipt.filename === 'string' ? receipt.filename : undefined;
    const type = 'type' in receipt && typeof receipt.type === 'string' ? receipt.type : undefined;
    return {localPath, filename, type};
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

export default getPendingReceiptRequests;
export {RECEIPT_BEARING_COMMANDS};
