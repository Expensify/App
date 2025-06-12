import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import {addAttachment, addComment} from '@libs/actions/Report';
import {rand64} from '@libs/NumberUtils';
import type {Attachment} from '@src/types/onyx';
import ONYXKEYS from '../../src/ONYXKEYS';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('react-native-blob-util', () => ({
    config: jest.fn(() => ({
        fetch: jest.fn(() =>
            Promise.resolve({
                path: jest.fn(() => '/mocked/path/to/file'),
            }),
        ),
    })),
    fs: {
        dirs: {
            DocumentDir: '/mocked/document/dir',
        },
    },
    fetch: jest.fn(() =>
        Promise.resolve({
            path: jest.fn(() => '/mocked/path/to/file'),
        }),
    ),
}));

describe('AttachmentStorage', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });
    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
    });

    it('should store for file in Onyx', async () => {
        // Mock file data
        const reportID = rand64();
        const fileData = {
            name: `test.jpg`,
            source: 'https://images.unsplash.com/photo-1726066012751-2adfb5485977?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxfHx8ZW58MHx8fHx8',
            uri: 'https://images.unsplash.com/photo-1726066012751-2adfb5485977?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxfHx8ZW58MHx8fHx8',
        };

        // Execute file upload
        addAttachment(reportID, fileData);

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

        // const cacheAPIAttachment = await CacheAPI.get(CONST.CACHE_API_KEYS.ATTACHMENTS, attachmentID);

        const attachmentLists = Object.values(attachments ?? {});
        const attachment = attachmentLists.at(0);
        const attachmentID = attachment?.attachmentID;

        expect(attachmentID).toBeDefined();

        // Verify Onyx storage
        expect(attachment).toEqual({
            attachmentID,
            source: 'file:///mocked/path/to/file',
            remoteSource: fileData.uri,
        });
    });
    it('should store markdown text link attachments in Onyx', async () => {
        // Mock file data
        const reportID = rand64();
        const sourceURL =
            'https://images.unsplash.com/photo-1726066012751-2adfb5485977?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxfHx8ZW58MHx8fHx8';
        const markdownTextLinkAttachment = `![](${sourceURL})`;

        // Execute file upload
        addComment(reportID, markdownTextLinkAttachment);

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

        const attachmentLists = Object.values(attachments ?? {});
        const attachment = attachmentLists.at(0);
        const attachmentID = attachment?.attachmentID;

        expect(attachmentID).toBeDefined();

        // Verify Onyx storage
        expect(attachment).toEqual({
            attachmentID,
            source: 'file:///mocked/path/to/file',
            remoteSource:
                'https://images.unsplash.com/photo-1726066012751-2adfb5485977?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxfHx8ZW58MHx8fHx8',
        });
    });
});
