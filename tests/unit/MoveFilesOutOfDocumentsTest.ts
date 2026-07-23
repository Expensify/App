import MoveFilesOutOfDocuments from '@libs/migrations/MoveFilesOutOfDocuments/index.ios';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

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
    unlink: jest.fn(() => Promise.resolve()),
}));

const mockRNFS: {
    exists: jest.Mock;
    unlink: jest.Mock;
} = jest.requireMock('react-native-fs');

const OLD_ATTACHMENT_DIR = '/mock/documents/attachments';
const STALE_ONYX_DUMP = `/mock/documents/${CONST.DEFAULT_ONYX_DUMP_FILE_NAME}`;

describe('MoveFilesOutOfDocuments migration (iOS)', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockRNFS.exists.mockImplementation(() => Promise.resolve(false));
        mockRNFS.unlink.mockImplementation(() => Promise.resolve());
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('does nothing when no internal files are left in Documents', async () => {
        await MoveFilesOutOfDocuments();

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

    it('removes a stale Onyx state dump left by older app versions', async () => {
        mockRNFS.exists.mockImplementation((path: string) => Promise.resolve(path === STALE_ONYX_DUMP));

        await MoveFilesOutOfDocuments();

        expect(mockRNFS.unlink).toHaveBeenCalledWith(STALE_ONYX_DUMP);
        expect(mockRNFS.unlink).not.toHaveBeenCalledWith(OLD_ATTACHMENT_DIR);
    });

    it('does not block startup when the cleanup fails', async () => {
        mockRNFS.exists.mockImplementation(() => Promise.resolve(true));
        mockRNFS.unlink.mockImplementation(() => Promise.reject(new Error('unlink failed')));

        await expect(MoveFilesOutOfDocuments()).resolves.toBeUndefined();
    });
});
