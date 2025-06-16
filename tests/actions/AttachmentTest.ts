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
    const reportID = rand64();

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });
    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
    });

    it('should store for file in Onyx', async () => {
        // Given the attachment data consisting of name, type and uri
        const fileData = {
            name: `TEST_ATTACHMENT_FILE`,
            type: 'image/jpeg',
            uri: 'https://images.unsplash.com/photo-1726066012751-2adfb5485977?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxfHx8ZW58MHx8fHx8',
        };

        // Then upload the attachment
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

        const attachmentLists = Object.values(attachments ?? {});
        const attachment = attachmentLists.at(0);
        const attachmentID = attachment?.attachmentID;

        // Then the attachmentID and attachment value should be defined
        expect(attachmentID).toBeDefined();
        expect(attachment).toEqual({
            attachmentID,
            source: 'file:///mocked/path/to/file',
            remoteSource: fileData.uri,
        });
    });
    it('should store markdown text link attachments in Onyx', async () => {
        // Given the attachment data consisting of sourceURL and markdown comment text
        const sourceURL =
            'https://images.unsplash.com/photo-1726066012751-2adfb5485977?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxfHx8ZW58MHx8fHx8';
        const markdownTextLinkAttachment = `![](${sourceURL})`;

        // Then send the comment
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

        // Then the attachmentID and attachment value should be defined
        expect(attachmentID).toBeDefined();
        expect(attachment).toEqual({
            attachmentID,
            source: 'file:///mocked/path/to/file',
            remoteSource:
                'https://images.unsplash.com/photo-1726066012751-2adfb5485977?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxfHx8ZW58MHx8fHx8',
        });
    });
});
