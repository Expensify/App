import {WRITE_COMMANDS} from '@libs/API/types';
import hasGalleryWritePermission from '@libs/fileDownload/hasGalleryWritePermission';
import saveLocalFileToGallery from '@libs/fileDownload/saveLocalFileToGallery';
import getPendingReceiptRequests, {getSaveablePendingReceiptRequests} from '@libs/savePendingReceiptsToGallery/getPendingReceiptRequests';
import saveReceiptsToGallery from '@libs/savePendingReceiptsToGallery/saveReceiptsToGallery';
import * as PersistedRequests from '@userActions/PersistedRequests';
import type {AnyRequest} from '@src/types/onyx/Request';

jest.mock('@userActions/PersistedRequests', () => ({
    getAll: jest.fn(() => []),
    getOngoingRequest: jest.fn(() => null),
    onInitialization: jest.fn(),
    onCrossTabRequestsMerged: jest.fn(),
}));

jest.mock('@libs/fileDownload/hasGalleryWritePermission', () => ({
    __esModule: true,
    default: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('@libs/fileDownload/saveLocalFileToGallery', () => ({
    __esModule: true,
    default: jest.fn(() => Promise.resolve()),
}));

const mockedHasPermission = jest.mocked(hasGalleryWritePermission);
const mockedWrite = jest.mocked(saveLocalFileToGallery);

const mockedGetAll = jest.mocked(PersistedRequests.getAll);
const mockedGetOngoing = jest.mocked(PersistedRequests.getOngoingRequest);

function buildRequest(command: string, receipt?: Record<string, unknown>): AnyRequest {
    return {command, data: receipt ? {receipt} : {}};
}

describe('getPendingReceiptRequests', () => {
    beforeEach(() => {
        mockedGetAll.mockReset();
        mockedGetOngoing.mockReset();
        mockedGetOngoing.mockReturnValue(null);
    });

    it('returns only local-file, receipt-bearing requests and skips remote and non-receipt requests', () => {
        mockedGetAll.mockReturnValue([
            buildRequest(WRITE_COMMANDS.REQUEST_MONEY, {source: 'file:///receipt-a.jpg', filename: 'a.jpg', type: 'image/jpeg'}),
            buildRequest(WRITE_COMMANDS.TRACK_EXPENSE, {localSource: 'file:///receipt-b.jpg', source: 'https://remote.example/b.jpg', filename: 'b.jpg', type: 'image/png'}),
            buildRequest(WRITE_COMMANDS.REPLACE_RECEIPT, {source: 'file:///receipt-c.jpg'}),
            buildRequest(WRITE_COMMANDS.SPLIT_BILL, {source: 'https://remote.example/d.jpg'}),
            buildRequest(WRITE_COMMANDS.REQUEST_MONEY),
            buildRequest('OpenReport', {source: 'file:///not-a-receipt.jpg'}),
        ]);

        const result = getPendingReceiptRequests();

        expect(result).toEqual([
            {localPath: 'file:///receipt-a.jpg', filename: 'a.jpg', type: 'image/jpeg'},
            {localPath: 'file:///receipt-b.jpg', filename: 'b.jpg', type: 'image/png'},
            {localPath: 'file:///receipt-c.jpg', filename: undefined, type: undefined},
        ]);
    });

    it('includes the in-flight request', () => {
        mockedGetOngoing.mockReturnValue(buildRequest(WRITE_COMMANDS.START_SPLIT_BILL, {source: 'file:///ongoing.jpg', filename: 'ongoing.jpg'}));
        mockedGetAll.mockReturnValue([]);

        const result = getPendingReceiptRequests();

        expect(result).toEqual([{localPath: 'file:///ongoing.jpg', filename: 'ongoing.jpg', type: undefined}]);
    });

    it('returns nothing when no receipt requests are pending', () => {
        mockedGetAll.mockReturnValue([buildRequest('OpenReport'), buildRequest(WRITE_COMMANDS.SPLIT_BILL, {source: 'https://remote.example/x.jpg'})]);

        expect(getPendingReceiptRequests()).toEqual([]);
    });

    it('reads the local path from a REPLACE_RECEIPT File shape that uses `uri` and `name` instead of `source`', () => {
        mockedGetAll.mockReturnValue([buildRequest(WRITE_COMMANDS.REPLACE_RECEIPT, {uri: 'file:///replaced.jpg', name: 'replaced.jpg', type: 'image/jpeg'})]);

        expect(getPendingReceiptRequests()).toEqual([{localPath: 'file:///replaced.jpg', filename: 'replaced.jpg', type: 'image/jpeg'}]);
    });

    it('picks up receipts on the other receipt-bearing commands (share, categorize, add-to-policy, send money)', () => {
        mockedGetAll.mockReturnValue([
            buildRequest(WRITE_COMMANDS.SHARE_TRACKED_EXPENSE, {source: 'file:///share.jpg', filename: 'share.jpg', type: 'image/jpeg'}),
            buildRequest(WRITE_COMMANDS.CATEGORIZE_TRACKED_EXPENSE, {source: 'file:///categorize.jpg', filename: 'categorize.jpg', type: 'image/jpeg'}),
            buildRequest(WRITE_COMMANDS.ADD_TRACKED_EXPENSE_TO_POLICY, {source: 'file:///policy.jpg', filename: 'policy.jpg', type: 'image/jpeg'}),
            buildRequest(WRITE_COMMANDS.SEND_MONEY_ELSEWHERE, {source: 'file:///send.jpg', filename: 'send.jpg', type: 'image/jpeg'}),
        ]);

        expect(getPendingReceiptRequests()).toEqual([
            {localPath: 'file:///share.jpg', filename: 'share.jpg', type: 'image/jpeg'},
            {localPath: 'file:///categorize.jpg', filename: 'categorize.jpg', type: 'image/jpeg'},
            {localPath: 'file:///policy.jpg', filename: 'policy.jpg', type: 'image/jpeg'},
            {localPath: 'file:///send.jpg', filename: 'send.jpg', type: 'image/jpeg'},
        ]);
    });
});

describe('getSaveablePendingReceiptRequests', () => {
    beforeEach(() => {
        mockedGetAll.mockReset();
        mockedGetOngoing.mockReset();
        mockedGetOngoing.mockReturnValue(null);
    });

    it('drops non-image receipts that the native gallery API cannot accept (PDF, DOC, HTML, ZIP)', () => {
        mockedGetAll.mockReturnValue([
            buildRequest(WRITE_COMMANDS.REQUEST_MONEY, {source: 'file:///image.jpg', filename: 'image.jpg', type: 'image/jpeg'}),
            buildRequest(WRITE_COMMANDS.REQUEST_MONEY, {source: 'file:///doc.pdf', filename: 'doc.pdf', type: 'application/pdf'}),
            buildRequest(WRITE_COMMANDS.REQUEST_MONEY, {source: 'file:///page.html', filename: 'page.html', type: 'text/html'}),
            buildRequest(WRITE_COMMANDS.REQUEST_MONEY, {source: 'file:///bundle.zip', filename: 'bundle.zip', type: 'application/zip'}),
        ]);

        expect(getSaveablePendingReceiptRequests()).toEqual([{localPath: 'file:///image.jpg', filename: 'image.jpg', type: 'image/jpeg'}]);
    });

    it('falls back to the filename extension when the mime type is missing', () => {
        mockedGetAll.mockReturnValue([
            buildRequest(WRITE_COMMANDS.REPLACE_RECEIPT, {uri: 'file:///IMG_0001.HEIC', name: 'IMG_0001.HEIC'}),
            buildRequest(WRITE_COMMANDS.REPLACE_RECEIPT, {uri: 'file:///doc.pdf', name: 'doc.pdf'}),
        ]);

        expect(getSaveablePendingReceiptRequests()).toEqual([{localPath: 'file:///IMG_0001.HEIC', filename: 'IMG_0001.HEIC', type: undefined}]);
    });

    it('returns an empty list when the queue holds only non-image receipts (offline-warning modal covers the loss)', () => {
        mockedGetAll.mockReturnValue([buildRequest(WRITE_COMMANDS.REQUEST_MONEY, {source: 'file:///only.pdf', filename: 'only.pdf', type: 'application/pdf'})]);

        expect(getSaveablePendingReceiptRequests()).toEqual([]);
    });
});

describe('saveReceiptsToGallery', () => {
    const receipts = [{localPath: 'file:///a.jpg'}, {localPath: 'file:///b.jpg'}, {localPath: 'file:///c.jpg'}];

    beforeEach(() => {
        mockedHasPermission.mockReset();
        mockedHasPermission.mockResolvedValue(true);
        mockedWrite.mockReset();
        mockedWrite.mockResolvedValue();
    });

    it('writes once per receipt and reports the saved count', async () => {
        const result = await saveReceiptsToGallery(receipts);

        expect(mockedWrite).toHaveBeenCalledTimes(3);
        expect(mockedWrite.mock.calls.at(0)?.at(0)).toBe('file:///a.jpg');
        expect(result).toEqual({savedCount: 3, failedCount: 0});
    });

    it('lets the batch survive a single rejection and counts it as failed', async () => {
        mockedWrite.mockResolvedValueOnce().mockRejectedValueOnce(new Error('write failed')).mockResolvedValueOnce();

        const result = await saveReceiptsToGallery(receipts);

        expect(mockedWrite).toHaveBeenCalledTimes(3);
        expect(result).toEqual({savedCount: 2, failedCount: 1});
    });

    it('skips the save and never writes when gallery permission is denied', async () => {
        mockedHasPermission.mockResolvedValue(false);

        const result = await saveReceiptsToGallery(receipts);

        expect(mockedWrite).not.toHaveBeenCalled();
        expect(result).toEqual({savedCount: 0, failedCount: 3});
    });

    it('swallows a thrown permission error rather than propagating it', async () => {
        mockedHasPermission.mockRejectedValue(new Error('permission blew up'));

        await expect(saveReceiptsToGallery(receipts)).resolves.toEqual({savedCount: 0, failedCount: 3});
    });

    it('does no work for an empty list', async () => {
        const result = await saveReceiptsToGallery([]);

        expect(mockedHasPermission).not.toHaveBeenCalled();
        expect(mockedWrite).not.toHaveBeenCalled();
        expect(result).toEqual({savedCount: 0, failedCount: 0});
    });
});
