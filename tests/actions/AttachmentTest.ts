import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import {rand64} from '@libs/NumberUtils';
import {getCachedAttachment} from '@userActions/Attachment';
import {addAttachment, addComment, deleteReportComment} from '@userActions/Report';
import CONST from '@src/CONST';
import type {Attachment, ReportAction} from '@src/types/onyx';
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
    beforeEach(async () => {
        Onyx.clear();
        await waitForBatchedUpdates();

        global.fetch = TestHelper.getGlobalFetchMock();
    });

    it('should store for file in Onyx', async () => {
        // Given the attachment data consisting of name, type and uri
        const fileData = {
            name: `TEST_ATTACHMENT_FILE`,
            type: 'image/jpeg',
            uri: 'https://images.unsplash.com/photo-1726066012751-2adfb5485977?w=500',
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
        const sourceURL = 'https://images.unsplash.com/photo-1726066012751-2adfb5485977?w=500';
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
            remoteSource: sourceURL,
        });
    });
    it('should re-cache when attachment file is changed', async () => {
        // Given the attachment data consisting of name, type and uri
        const fileData = {
            name: `TEST_ATTACHMENT_FILE`,
            type: 'image/jpeg',
            uri: 'https://images.unsplash.com/photo-1726066012751-2adfb5485977?w=500',
        };

        let attachments: OnyxCollection<Attachment>;

        Onyx.connect({
            key: ONYXKEYS.COLLECTION.ATTACHMENT,
            waitForCollectionCallback: true,
            callback: (value) => {
                if (!value) {
                    return;
                }
                attachments = value;
            },
        });

        await waitForBatchedUpdates();

        // Then upload the attachment
        addAttachment(reportID, fileData);

        await waitForBatchedUpdates();

        const attachment = Object.values(attachments ?? {}).at(0);
        const attachmentID = attachment?.attachmentID;

        // Then the attachmentID and attachment value should be defined
        expect(attachmentID).toBeDefined();
        expect(attachment).toEqual({
            attachmentID,
            source: 'file:///mocked/path/to/file',
            remoteSource: fileData.uri,
        });

        if (!attachmentID) {
            return;
        }

        // Given the new markdown attachment link
        const newSourceURL = 'https://images.unsplash.com/photo-1726066012751-2adfb5485977?w=100';
        getCachedAttachment(attachmentID, attachment, newSourceURL);

        await waitForBatchedUpdates();

        const newAttachment = Object.values(attachments ?? {}).at(0);

        // Then the attachment should be updated with new attachment
        expect(newAttachment).toEqual({
            attachmentID,
            source: 'file:///mocked/path/to/file',
            remoteSource: newSourceURL,
        });
    });
    it('should re-cache when markdown image link is changed', async () => {
        // Given the attachment data consisting of sourceURL and markdown comment text
        const sourceURL = 'https://images.unsplash.com/photo-1726066012751-2adfb5485977?w=500';
        const markdownTextLinkAttachment = `![](${sourceURL})`;

        let attachments: OnyxCollection<Attachment>;

        Onyx.connect({
            key: ONYXKEYS.COLLECTION.ATTACHMENT,
            waitForCollectionCallback: true,
            callback: (value) => {
                if (!value) {
                    return;
                }
                attachments = value;
            },
        });

        await waitForBatchedUpdates();

        // Then send the comment
        addComment(reportID, markdownTextLinkAttachment);

        await waitForBatchedUpdates();

        const attachment = Object.values(attachments ?? {}).at(0);
        const attachmentID = attachment?.attachmentID;

        // Then the attachmentID and attachment value should be defined
        expect(attachmentID).toBeDefined();
        expect(attachment).toEqual({
            attachmentID,
            source: 'file:///mocked/path/to/file',
            remoteSource: sourceURL,
        });

        if (!attachmentID) {
            return;
        }

        // Given the new markdown attachment link
        const newSourceURL = 'https://images.unsplash.com/photo-1726066012751-2adfb5485977?w=100';
        getCachedAttachment(attachmentID, attachment, newSourceURL);

        await waitForBatchedUpdates();

        const newAttachment = Object.values(attachments ?? {}).at(0);

        // Then the attachment should be updated with new attachment link
        expect(newAttachment).toEqual({
            attachmentID,
            source: 'file:///mocked/path/to/file',
            remoteSource: newSourceURL,
        });
    });
    it('should remove attachment file when deleting attachment comment', async () => {
        // Given the attachment data consisting of name, type and uri
        const fileData = {
            name: `TEST_ATTACHMENT_FILE`,
            type: 'image/jpeg',
            uri: 'https://images.unsplash.com/photo-1726066012751-2adfb5485977?w=500',
        };

        let reportActions: OnyxCollection<ReportAction>;
        let attachments: OnyxCollection<Attachment>;

        Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            callback: (val) => (reportActions = val),
        });

        Onyx.connect({
            key: ONYXKEYS.COLLECTION.ATTACHMENT,
            waitForCollectionCallback: true,
            callback: (value) => {
                if (!value) {
                    return;
                }
                attachments = value;
            },
        });

        await waitForBatchedUpdates();

        // Then upload the attachment
        addAttachment(reportID, fileData);

        await waitForBatchedUpdates();

        const attachmentAction = Object.values(reportActions ?? {}).find((reportAction) => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT);
        const newAttachment = Object.values(attachments ?? {}).at(0);
        const attachmentID = newAttachment?.attachmentID;

        // Then the attachmentID and attachment value should be defined
        expect(attachmentID).toBeDefined();
        expect(newAttachment).toEqual({
            attachmentID,
            source: 'file:///mocked/path/to/file',
            remoteSource: fileData.uri,
        });

        if (!attachmentAction) {
            return;
        }

        // Delete attachment
        deleteReportComment(reportID, attachmentAction);
        await waitForBatchedUpdates();

        // Then the attachment should be removed
        const removedAttachment = attachments?.[`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`];
        expect(removedAttachment).toBeUndefined();
    });
    it('should remove markdown attachment when deleting comment', async () => {
        // Given the attachment data consisting of sourceURL and markdown comment text
        const sourceURL = 'https://images.unsplash.com/photo-1726066012751-2adfb5485977?w=500';
        const markdownTextLinkAttachment = `![](${sourceURL})`;

        let reportActions: OnyxCollection<ReportAction>;
        let attachments: OnyxCollection<Attachment>;

        Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            callback: (val) => (reportActions = val),
        });

        Onyx.connect({
            key: ONYXKEYS.COLLECTION.ATTACHMENT,
            waitForCollectionCallback: true,
            callback: (value) => {
                if (!value) {
                    return;
                }
                attachments = value;
            },
        });

        await waitForBatchedUpdates();

        // Then send the comment
        addComment(reportID, markdownTextLinkAttachment);

        await waitForBatchedUpdates();

        const attachmentAction = Object.values(reportActions ?? {}).find((reportAction) => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT);
        const newAttachment = Object.values(attachments ?? {}).at(0);
        const attachmentID = newAttachment?.attachmentID;

        // Then the attachmentID and attachment value should be defined
        expect(attachmentID).toBeDefined();
        expect(newAttachment).toEqual({
            attachmentID,
            source: 'file:///mocked/path/to/file',
            remoteSource: sourceURL,
        });

        if (!attachmentAction) {
            return;
        }

        // Delete attachment
        deleteReportComment(reportID, attachmentAction);
        await waitForBatchedUpdates();

        const removedAttachment = attachments?.[`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`];

        // Then the attachment should be removed
        expect(removedAttachment).toBeUndefined();
    });
});
