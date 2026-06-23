import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {Attachment} from '@src/types/onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import * as TestHelper from '../../../utils/TestHelper';
import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

// ─── Same mocks as tests/actions/AttachmentTest.ts ──────────────────────────────

jest.mock('react-native-fs', () => ({
    DocumentDirectoryPath: '/mock/documents',
    copyFile: jest.fn(() => Promise.resolve()),
    exists: jest.fn(() => Promise.resolve(true)),
    mkdir: jest.fn(() => Promise.resolve()),
    unlink: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-blob-util', () => ({
    config: jest.fn((data: {path?: string} | undefined) => {
        const filePath: string = data?.path ?? '/mock/documents/file';
        return {
            fetch: jest.fn(() =>
                Promise.resolve({
                    path: jest.fn((): string => filePath),
                }),
            ),
        };
    }),
    fs: {
        dirs: {
            DocumentDir: '/mock/documents',
        },
    },
    fetch: jest.fn(() =>
        Promise.resolve({
            path: jest.fn((): string => '/mock/documents/file'),
        }),
    ),
}));

// CacheAPI uses browser `caches` — not available in Jest/Node
jest.mock('@libs/CacheAPI', () => ({
    __esModule: true,
    default: {
        put: jest.fn(() => Promise.resolve()),
        get: jest.fn(() => Promise.resolve(null)),
        remove: jest.fn(() => Promise.resolve(true)),
        clear: jest.fn(() => Promise.resolve(true)),
    },
}));

describe('Attachment actions (native)', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const {cacheAttachment, getCachedAttachment, removeCachedAttachment, clearCachedAttachments, getAttachmentLocalSource} = require('../../../../src/libs/actions/Attachment/index.native');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RNFS = require('react-native-fs');

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        Onyx.clear();
        await waitForBatchedUpdates();

        global.fetch = TestHelper.getGlobalFetchMock({
            headers: new Headers({
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Type': 'image/jpg',
            }),
        });
    });

    it('should copy local file to attachment directory and store in Onyx', async () => {
        await cacheAttachment({uri: 'file:///mock/documents/upload.jpg', attachmentID: 'local-1'});
        await waitForBatchedUpdates();

        const attachments = await new Promise<OnyxCollection<Attachment>>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.COLLECTION.ATTACHMENT,
                waitForCollectionCallback: true,
                callback: (value) => {
                    Onyx.disconnect(connection);
                    resolve(value);
                },
            });
        });

        expect(RNFS.copyFile).toHaveBeenCalledWith('file:///mock/documents/upload.jpg', expect.stringContaining('local-1'));
        expect(attachments?.[`${ONYXKEYS.COLLECTION.ATTACHMENT}local-1`]).toEqual({
            attachmentID: 'local-1',
            source: expect.stringContaining('local-1'),
        });
    });

    it('should return local source after caching a file', async () => {
        await cacheAttachment({uri: 'file:///mock/documents/upload.jpg', attachmentID: 'local-2'});
        await waitForBatchedUpdates();

        expect(getAttachmentLocalSource('local-2')).toBeDefined();
    });

    it('should skip caching for auth remote attachments on native', async () => {
        const result = await cacheAttachment({uri: 'https://example.com/image.png', authToken: 'token', attachmentID: 'auth-1'});
        expect(result).toBeUndefined();
    });

    it('should throw and clean up when copyFile fails', async () => {
        RNFS.copyFile.mockRejectedValueOnce(new Error('disk full'));

        await expect(cacheAttachment({uri: 'file:///mock/documents/upload.jpg', attachmentID: 'fail-1'})).rejects.toThrow(
            '[AttachmentCache] Failed to cache attachment',
        );
        expect(getAttachmentLocalSource('fail-1')).toBeUndefined();
    });

    it('should return file:// URI from getCachedAttachment when local source exists', async () => {
        await cacheAttachment({uri: 'file:///mock/documents/upload.jpg', attachmentID: 'cached-1'});
        await waitForBatchedUpdates();

        const result = await getCachedAttachment({uri: 'https://example.com/image.png', attachmentID: 'cached-1'});
        expect(result).toContain('file://');
    });

    it('should return file:// prefixed path from getCachedAttachment when localSource is provided and file exists', async () => {
        const result = await getCachedAttachment({
            uri: 'https://example.com/image.png',
            attachmentID: 'onyx-cached-1',
            localSource: '/mock/documents/attachments/cached.jpg',
        });

        expect(result).toBe('file:///mock/documents/attachments/cached.jpg');
    });

    it('should remove stale local source when file no longer exists', async () => {
        await cacheAttachment({uri: 'file:///mock/documents/upload.jpg', attachmentID: 'stale-1'});
        await waitForBatchedUpdates();

        RNFS.exists.mockResolvedValue(false);

        const result = await getCachedAttachment({uri: 'https://example.com/image.png', attachmentID: 'stale-1'});
        expect(result).toBeUndefined();
        expect(getAttachmentLocalSource('stale-1')).toBeUndefined();
    });

    it('should return early from removeCachedAttachment when localSource is not provided', async () => {
        await removeCachedAttachment({attachmentID: 'no-local-1'});
        await waitForBatchedUpdates();

        expect(RNFS.unlink).not.toHaveBeenCalled();
    });

    it('should delete file and clear Onyx when removeCachedAttachment is called with localSource', async () => {
        RNFS.exists.mockResolvedValue(true);

        await removeCachedAttachment({attachmentID: 'remove-1', localSource: '/mock/documents/attachments/remove.jpg'});
        await waitForBatchedUpdates();

        expect(RNFS.unlink).toHaveBeenCalledWith('/mock/documents/attachments/remove.jpg');

        const attachments = await new Promise<OnyxCollection<Attachment>>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.COLLECTION.ATTACHMENT,
                waitForCollectionCallback: true,
                callback: (value) => {
                    Onyx.disconnect(connection);
                    resolve(value);
                },
            });
        });

        expect(attachments?.[`${ONYXKEYS.COLLECTION.ATTACHMENT}remove-1`]).toBeUndefined();
    });

    it('should clear attachment directory and reset Onyx via clearCachedAttachments', async () => {
        RNFS.exists.mockResolvedValue(true);

        await clearCachedAttachments();
        await waitForBatchedUpdates();

        expect(RNFS.unlink).toHaveBeenCalledWith(expect.stringContaining('attachments'));

        const attachments = await new Promise<OnyxCollection<Attachment>>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.COLLECTION.ATTACHMENT,
                waitForCollectionCallback: true,
                callback: (value) => {
                    Onyx.disconnect(connection);
                    resolve(value);
                },
            });
        });

        expect(Object.values(attachments ?? {}).length).toBe(0);
    });

    it('should skip directory deletion via clearCachedAttachments when dir does not exist', async () => {
        RNFS.exists.mockResolvedValue(false);

        await clearCachedAttachments();
        await waitForBatchedUpdates();

        expect(RNFS.unlink).not.toHaveBeenCalled();
    });
});

// ─── Web Tests ──────────────────────────────────────────────────────────────────

describe('Attachment actions (web)', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, import/extensions
    const {cacheAttachment, removeCachedAttachment, clearCachedAttachments, getAttachmentLocalSource} = require('../../../../src/libs/actions/Attachment/index.ts');

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        Onyx.clear();
        await waitForBatchedUpdates();

        // getGlobalFetchMock doesn't provide blob()/clone() which web cacheAttachment needs
        global.fetch = TestHelper.getGlobalFetchMock({
            headers: new Headers({
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Type': 'image/jpg',
            }),
            clone: jest.fn().mockReturnThis(),
            blob: jest.fn().mockResolvedValue(new Blob(['data'], {type: 'image/jpg'})),
        });
        global.URL.createObjectURL = jest.fn().mockReturnValue('blob:http://localhost/cached-url');
        global.URL.revokeObjectURL = jest.fn();
    });

    it('should return undefined when attachmentID is undefined', () => {
        expect(getAttachmentLocalSource(undefined)).toBeUndefined();
    });

    it('should cache auth remote attachment in AUTH_IMAGES cache', async () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const CacheAPI = require('@libs/CacheAPI').default;

        await cacheAttachment({uri: 'https://example.com/image.png', authToken: 'token123'});
        await waitForBatchedUpdates();

        expect(CacheAPI.put).toHaveBeenCalledWith(CONST.CACHE_NAME.AUTH_IMAGES, 'https://example.com/image.png', expect.anything());
    });

    it('should cache local file attachment with attachmentID in ATTACHMENTS cache and store in Onyx', async () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const CacheAPI = require('@libs/CacheAPI').default;

        // Use file:// URI to avoid the markdown path (fetchExternalAttachment needs browser APIs)
        await cacheAttachment({uri: 'file:///mock/documents/upload.jpg', attachmentID: 'web-1'});
        await waitForBatchedUpdates();

        expect(CacheAPI.put).toHaveBeenCalledWith(CONST.CACHE_NAME.ATTACHMENTS, 'web-1', expect.anything());

        const attachments = await new Promise<OnyxCollection<Attachment>>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.COLLECTION.ATTACHMENT,
                waitForCollectionCallback: true,
                callback: (value) => {
                    Onyx.disconnect(connection);
                    resolve(value);
                },
            });
        });

        expect(attachments?.[`${ONYXKEYS.COLLECTION.ATTACHMENT}web-1`]).toEqual(expect.objectContaining({attachmentID: 'web-1'}));
    });

    it('should return existing local source on repeated cacheAttachment call without re-fetching', async () => {
        // Use file:// URI to avoid the markdown path
        await cacheAttachment({uri: 'file:///mock/documents/upload.jpg', attachmentID: 'web-2'});
        const second = await cacheAttachment({uri: 'file:///mock/documents/upload.jpg', attachmentID: 'web-2'});

        expect(second).toBeDefined();
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should remove cached attachment via removeCachedAttachment and clear Onyx', async () => {
        await removeCachedAttachment({attachmentID: 'web-remove-1'});
        await waitForBatchedUpdates();

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const CacheAPI = require('@libs/CacheAPI').default;

        expect(CacheAPI.remove).toHaveBeenCalledWith(CONST.CACHE_NAME.ATTACHMENTS, 'web-remove-1');

        const attachments = await new Promise<OnyxCollection<Attachment>>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.COLLECTION.ATTACHMENT,
                waitForCollectionCallback: true,
                callback: (value) => {
                    Onyx.disconnect(connection);
                    resolve(value);
                },
            });
        });

        expect(attachments?.[`${ONYXKEYS.COLLECTION.ATTACHMENT}web-remove-1`]).toBeUndefined();
    });

    it('should clear all caches and reset Onyx via clearCachedAttachments', async () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const CacheAPI = require('@libs/CacheAPI').default;

        await clearCachedAttachments();
        await waitForBatchedUpdates();

        expect(CacheAPI.clear).toHaveBeenCalledWith(CONST.CACHE_NAME.AUTH_IMAGES);
        expect(CacheAPI.clear).toHaveBeenCalledWith(CONST.CACHE_NAME.ATTACHMENTS);

        const attachments = await new Promise<OnyxCollection<Attachment>>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.COLLECTION.ATTACHMENT,
                waitForCollectionCallback: true,
                callback: (value) => {
                    Onyx.disconnect(connection);
                    resolve(value);
                },
            });
        });

        expect(Object.values(attachments ?? {}).length).toBe(0);
    });
});