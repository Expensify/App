import MoveFilesOutOfDocuments from '@libs/migrations/MoveFilesOutOfDocuments/index.ios';

import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyRequest} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Importing the real Log module pulls in the network stack, whose persisted-request
// bookkeeping reacts to the Onyx writes made in these tests.
jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {info: jest.fn(), warn: jest.fn(), alert: jest.fn()},
}));

jest.mock('react-native-fs', () => ({
    DocumentDirectoryPath: '/mock/documents',
    exists: jest.fn(() => Promise.resolve(false)),
    mkdir: jest.fn(() => Promise.resolve()),
    readDir: jest.fn(() => Promise.resolve([])),
    copyFile: jest.fn(() => Promise.resolve()),
    unlink: jest.fn(() => Promise.resolve()),
}));

const NEW_UPLOAD_FOLDER = '/mock/library/Application Support/Receipts-Upload';

jest.mock('@libs/getReceiptsUploadFolderPath', () => ({
    __esModule: true,
    default: jest.fn(() => NEW_UPLOAD_FOLDER),
}));

const mockRNFS: {
    exists: jest.Mock;
    mkdir: jest.Mock;
    readDir: jest.Mock;
    copyFile: jest.Mock;
    unlink: jest.Mock;
} = jest.requireMock('react-native-fs');

const OLD_RECEIPTS_DIR = '/mock/documents/Receipts-Upload';
const OLD_ATTACHMENT_DIR = '/mock/documents/attachments';

// The container path persisted before the app update differs from the current one because
// iOS moves the app container on every update.
const STALE_CONTAINER_RECEIPTS_DIR = '/mock/old-container/Documents/Receipts-Upload';

const RECEIPT_A = 'receipt_a.jpg';
const RECEIPT_B = 'receipt_b.jpg';
const STALE_URI_A = `file://${STALE_CONTAINER_RECEIPTS_DIR}/${RECEIPT_A}`;
const STALE_URI_B = `file://${STALE_CONTAINER_RECEIPTS_DIR}/${RECEIPT_B}`;
const NEW_URI_A = `file://${NEW_UPLOAD_FOLDER}/${RECEIPT_A}`;
const NEW_URI_B = `file://${NEW_UPLOAD_FOLDER}/${RECEIPT_B}`;
const SERVER_RECEIPT_URL = 'https://www.expensify.com/receipts/w_abc.jpg';

function buildQueuedRequest(fileName: string, uri: string): AnyRequest {
    return {
        command: 'RequestMoney',
        data: {
            transactionID: '123',
            receipt: {source: uri, uri, name: fileName, type: 'image/jpeg'},
        },
        optimisticData: [
            {
                onyxMethod: 'merge',
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}123`,
                value: {receipt: {source: uri}},
            },
        ],
    };
}

describe('MoveFilesOutOfDocuments migration (iOS)', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockRNFS.exists.mockImplementation((path: string) => Promise.resolve(path === OLD_RECEIPTS_DIR));
        mockRNFS.mkdir.mockImplementation(() => Promise.resolve());
        mockRNFS.readDir.mockImplementation(() =>
            Promise.resolve([
                {name: RECEIPT_A, path: `${OLD_RECEIPTS_DIR}/${RECEIPT_A}`},
                {name: RECEIPT_B, path: `${OLD_RECEIPTS_DIR}/${RECEIPT_B}`},
            ]),
        );
        mockRNFS.copyFile.mockImplementation(() => Promise.resolve());
        mockRNFS.unlink.mockImplementation(() => Promise.resolve());
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('does nothing when the old directories do not exist', async () => {
        mockRNFS.exists.mockImplementation(() => Promise.resolve(false));

        await MoveFilesOutOfDocuments();

        expect(mockRNFS.copyFile).not.toHaveBeenCalled();
        expect(mockRNFS.unlink).not.toHaveBeenCalled();
    });

    it('removes the old attachment cache and clears the attachment collection', async () => {
        mockRNFS.exists.mockImplementation((path: string) => Promise.resolve(path === OLD_ATTACHMENT_DIR));
        await Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}source1`, {source: `${OLD_ATTACHMENT_DIR}/file.pdf`});
        await waitForBatchedUpdates();

        await MoveFilesOutOfDocuments();
        await waitForBatchedUpdates();

        expect(mockRNFS.unlink).toHaveBeenCalledWith(OLD_ATTACHMENT_DIR);
        const attachment = await getOnyxValue(`${ONYXKEYS.COLLECTION.ATTACHMENT}source1`);
        expect(attachment).toBeUndefined();
    });

    it('copies queued receipts and rewrites persisted paths before removing the old directory', async () => {
        await Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, [buildQueuedRequest(RECEIPT_A, STALE_URI_A)]);
        await Onyx.set(ONYXKEYS.PERSISTED_ONGOING_REQUESTS, buildQueuedRequest(RECEIPT_B, STALE_URI_B));
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}123`, {transactionID: '123', receipt: {source: STALE_URI_A}});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}999`, {transactionID: '999', receipt: {source: SERVER_RECEIPT_URL}});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}456`, {transactionID: '456', receipt: {source: STALE_URI_B}});
        await waitForBatchedUpdates();

        await MoveFilesOutOfDocuments();
        await waitForBatchedUpdates();

        expect(mockRNFS.copyFile).toHaveBeenCalledWith(`${OLD_RECEIPTS_DIR}/${RECEIPT_A}`, `${NEW_UPLOAD_FOLDER}/${RECEIPT_A}`);
        expect(mockRNFS.copyFile).toHaveBeenCalledWith(`${OLD_RECEIPTS_DIR}/${RECEIPT_B}`, `${NEW_UPLOAD_FOLDER}/${RECEIPT_B}`);
        expect(mockRNFS.unlink).toHaveBeenCalledWith(OLD_RECEIPTS_DIR);

        // The persisted request's receipt source/uri and its optimistic transaction data
        // are all rewritten to the new upload folder.
        const persistedRequests = await getOnyxValue(ONYXKEYS.PERSISTED_REQUESTS);
        expect(persistedRequests).toEqual([buildQueuedRequest(RECEIPT_A, NEW_URI_A)]);

        const ongoingRequest = await getOnyxValue(ONYXKEYS.PERSISTED_ONGOING_REQUESTS);
        expect(ongoingRequest).toEqual(buildQueuedRequest(RECEIPT_B, NEW_URI_B));

        const transaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}123`);
        expect(transaction?.receipt?.source).toBe(NEW_URI_A);

        // A receipt that was already uploaded points at the server and is left untouched
        const uploadedTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}999`);
        expect(uploadedTransaction?.receipt?.source).toBe(SERVER_RECEIPT_URL);

        const draftTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}456`);
        expect(draftTransaction?.receipt?.source).toBe(NEW_URI_B);
    });

    it('keeps the old directory and points persisted paths at it when a copy fails', async () => {
        mockRNFS.copyFile.mockImplementation((source: string) => (source.endsWith(RECEIPT_B) ? Promise.reject(new Error('copy failed')) : Promise.resolve()));
        await Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, [buildQueuedRequest(RECEIPT_A, STALE_URI_A), buildQueuedRequest(RECEIPT_B, STALE_URI_B)]);
        await waitForBatchedUpdates();

        await MoveFilesOutOfDocuments();
        await waitForBatchedUpdates();

        // The directory keeps the only remaining copy of the failed receipt; only the
        // successfully copied original is removed.
        expect(mockRNFS.unlink).not.toHaveBeenCalledWith(OLD_RECEIPTS_DIR);
        expect(mockRNFS.unlink).toHaveBeenCalledWith(`${OLD_RECEIPTS_DIR}/${RECEIPT_A}`);
        expect(mockRNFS.unlink).not.toHaveBeenCalledWith(`${OLD_RECEIPTS_DIR}/${RECEIPT_B}`);

        // The copied receipt points at the new folder, and the failed one is refreshed to the
        // old directory under the current container path, since the stale container path no
        // longer exists.
        const persistedRequests = await getOnyxValue(ONYXKEYS.PERSISTED_REQUESTS);
        expect(persistedRequests).toEqual([buildQueuedRequest(RECEIPT_A, NEW_URI_A), buildQueuedRequest(RECEIPT_B, `file://${OLD_RECEIPTS_DIR}/${RECEIPT_B}`)]);
    });
});
