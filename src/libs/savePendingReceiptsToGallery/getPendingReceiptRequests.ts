import {WRITE_COMMANDS} from '@libs/API/types';
import {isLocalFile} from '@libs/fileDownload/FileUtils';
import {isRecord} from '@libs/ObjectUtils';
import {getAll, getOngoingRequest} from '@userActions/PersistedRequests';
import type {PendingReceipt} from './types';

const RECEIPT_BEARING_COMMANDS = new Set<string>([
    WRITE_COMMANDS.REQUEST_MONEY,
    WRITE_COMMANDS.TRACK_EXPENSE,
    WRITE_COMMANDS.SPLIT_BILL,
    WRITE_COMMANDS.SPLIT_BILL_AND_OPEN_REPORT,
    WRITE_COMMANDS.START_SPLIT_BILL,
    WRITE_COMMANDS.REPLACE_RECEIPT,
    WRITE_COMMANDS.SEND_MONEY_ELSEWHERE,
    WRITE_COMMANDS.SEND_MONEY_WITH_WALLET,
    WRITE_COMMANDS.SHARE_TRACKED_EXPENSE,
    WRITE_COMMANDS.CATEGORIZE_TRACKED_EXPENSE,
    WRITE_COMMANDS.ADD_TRACKED_EXPENSE_TO_POLICY,
]);

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

export default getPendingReceiptRequests;
