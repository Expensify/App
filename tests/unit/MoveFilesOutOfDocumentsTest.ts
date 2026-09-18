import MoveFilesOutOfDocuments from '@libs/migrations/MoveFilesOutOfDocuments/index.native';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import fs from 'fs';
import path from 'path';
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
    CachesDirectoryPath: '/mock/caches',
    exists: jest.fn(() => Promise.resolve(false)),
    unlink: jest.fn(() => Promise.resolve()),
    moveFile: jest.fn(() => Promise.resolve()),
    readDir: jest.fn(() => Promise.resolve([])),
}));

const mockRNFS: {
    exists: jest.Mock;
    unlink: jest.Mock;
    moveFile: jest.Mock;
    readDir: jest.Mock;
} = jest.requireMock('react-native-fs');

const OLD_ATTACHMENT_DIR = '/mock/documents/attachments';
const NEW_ATTACHMENT_DIR = '/mock/caches/attachments';
const STALE_ONYX_DUMP = `/mock/documents/${CONST.DEFAULT_ONYX_DUMP_FILE_NAME}`;
const OLD_EXPORT_STAGING_DIR = '/mock/documents/Expensify';

describe('MoveFilesOutOfDocuments migration (native)', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockRNFS.exists.mockImplementation(() => Promise.resolve(false));
        mockRNFS.unlink.mockImplementation(() => Promise.resolve());
        mockRNFS.moveFile.mockImplementation(() => Promise.resolve());
        mockRNFS.readDir.mockImplementation(() => Promise.resolve([]));
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('does nothing when no internal files are left in the document directory', async () => {
        await MoveFilesOutOfDocuments();

        expect(mockRNFS.unlink).not.toHaveBeenCalled();
        expect(mockRNFS.moveFile).not.toHaveBeenCalled();
    });

    it('moves the old attachment cache directory when the new one does not exist yet', async () => {
        mockRNFS.exists.mockImplementation((existsPath: string) => Promise.resolve(existsPath === OLD_ATTACHMENT_DIR));

        await MoveFilesOutOfDocuments();

        expect(mockRNFS.moveFile).toHaveBeenCalledWith(OLD_ATTACHMENT_DIR, NEW_ATTACHMENT_DIR);
        expect(mockRNFS.unlink).not.toHaveBeenCalledWith(OLD_ATTACHMENT_DIR);
    });

    it('merges old attachment files into an existing new directory, keeping newer copies on collision', async () => {
        mockRNFS.exists.mockImplementation((existsPath: string) =>
            Promise.resolve(existsPath === OLD_ATTACHMENT_DIR || existsPath === NEW_ATTACHMENT_DIR || existsPath === `${NEW_ATTACHMENT_DIR}/2.jpg`),
        );
        mockRNFS.readDir.mockImplementation(() =>
            Promise.resolve([
                {name: '1.jpg', path: `${OLD_ATTACHMENT_DIR}/1.jpg`},
                {name: '2.jpg', path: `${OLD_ATTACHMENT_DIR}/2.jpg`},
            ]),
        );

        await MoveFilesOutOfDocuments();

        expect(mockRNFS.moveFile).toHaveBeenCalledWith(`${OLD_ATTACHMENT_DIR}/1.jpg`, `${NEW_ATTACHMENT_DIR}/1.jpg`);
        expect(mockRNFS.moveFile).not.toHaveBeenCalledWith(`${OLD_ATTACHMENT_DIR}/2.jpg`, `${NEW_ATTACHMENT_DIR}/2.jpg`);
        expect(mockRNFS.unlink).toHaveBeenCalledWith(OLD_ATTACHMENT_DIR);
    });

    it('rewrites attachment record paths to the new cache directory and preserves their other fields', async () => {
        mockRNFS.exists.mockImplementation((existsPath: string) => Promise.resolve(existsPath === OLD_ATTACHMENT_DIR));
        await Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}source1`, {attachmentID: 'source1', source: `${OLD_ATTACHMENT_DIR}/file.jpg`, remoteSource: 'https://example.com/file.jpg'});
        await waitForBatchedUpdates();

        await MoveFilesOutOfDocuments();
        await waitForBatchedUpdates();

        const attachment = await getOnyxValue(`${ONYXKEYS.COLLECTION.ATTACHMENT}source1`);
        expect(attachment).toEqual({attachmentID: 'source1', source: `${NEW_ATTACHMENT_DIR}/file.jpg`, remoteSource: 'https://example.com/file.jpg'});
    });

    it('rewrites attachment record paths even when the old directory is already gone', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}source1`, {attachmentID: 'source1', source: `${OLD_ATTACHMENT_DIR}/file.jpg`});
        await waitForBatchedUpdates();

        await MoveFilesOutOfDocuments();
        await waitForBatchedUpdates();

        const attachment = await getOnyxValue(`${ONYXKEYS.COLLECTION.ATTACHMENT}source1`);
        expect(attachment).toEqual({attachmentID: 'source1', source: `${NEW_ATTACHMENT_DIR}/file.jpg`});
    });

    it('leaves attachment records already pointing at the new directory untouched on a repeat run', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}source1`, {attachmentID: 'source1', source: `${NEW_ATTACHMENT_DIR}/file.jpg`});
        await waitForBatchedUpdates();
        const mergeCollectionSpy = jest.spyOn(Onyx, 'mergeCollection');

        await MoveFilesOutOfDocuments();
        await waitForBatchedUpdates();

        expect(mergeCollectionSpy).not.toHaveBeenCalled();
        const attachment = await getOnyxValue(`${ONYXKEYS.COLLECTION.ATTACHMENT}source1`);
        expect(attachment).toEqual({attachmentID: 'source1', source: `${NEW_ATTACHMENT_DIR}/file.jpg`});
        mergeCollectionSpy.mockRestore();
    });

    it('skips the attachment record scan on later launches once it has completed', async () => {
        await MoveFilesOutOfDocuments();
        await waitForBatchedUpdates();
        expect(await getOnyxValue(ONYXKEYS.ATTACHMENT_RECORD_PATHS_MIGRATED)).toBe(true);

        // A record with an old-directory path written after the first run stays untouched, proving the scan no longer runs
        await Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}source1`, {attachmentID: 'source1', source: `${OLD_ATTACHMENT_DIR}/file.jpg`});
        await waitForBatchedUpdates();

        await MoveFilesOutOfDocuments();
        await waitForBatchedUpdates();

        const attachment = await getOnyxValue(`${ONYXKEYS.COLLECTION.ATTACHMENT}source1`);
        expect(attachment).toEqual({attachmentID: 'source1', source: `${OLD_ATTACHMENT_DIR}/file.jpg`});
    });

    it('removes a stale Onyx state dump left by older app versions', async () => {
        mockRNFS.exists.mockImplementation((existsPath: string) => Promise.resolve(existsPath === STALE_ONYX_DUMP));

        await MoveFilesOutOfDocuments();

        expect(mockRNFS.unlink).toHaveBeenCalledWith(STALE_ONYX_DUMP);
        expect(mockRNFS.unlink).not.toHaveBeenCalledWith(OLD_ATTACHMENT_DIR);
    });

    it('removes the old export staging directory left by older app versions', async () => {
        mockRNFS.exists.mockImplementation((existsPath: string) => Promise.resolve(existsPath === OLD_EXPORT_STAGING_DIR));

        await MoveFilesOutOfDocuments();

        expect(mockRNFS.unlink).toHaveBeenCalledWith(OLD_EXPORT_STAGING_DIR);
    });

    it('does not block startup when the cleanup fails', async () => {
        mockRNFS.exists.mockImplementation(() => Promise.resolve(true));
        mockRNFS.moveFile.mockImplementation(() => Promise.reject(new Error('move failed')));
        mockRNFS.unlink.mockImplementation(() => Promise.reject(new Error('unlink failed')));

        await expect(MoveFilesOutOfDocuments()).resolves.toBeUndefined();
    });

    it('keeps iOS NitroSQLite databases in Application Support', () => {
        const infoPlist = fs.readFileSync(path.resolve(__dirname, '../../ios/NewExpensify/Info.plist'), 'utf8');

        // Without this opt-in, NitroSQLite stores OnyxDB in the user-visible Documents directory.
        expect(infoPlist).toMatch(/<key>RNNitroSQLite_DatabaseLocation<\/key>\s*<string>ApplicationSupport<\/string>/);
    });
});
