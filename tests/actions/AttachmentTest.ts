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

jest.mock('react-native-fs', () => ({
    DocumentDirectoryPath: '/mock/documents',
    writeFile: jest.fn(() => Promise.resolve()),
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

        // Mock global fetch and response for attachment
        global.fetch = TestHelper.getGlobalFetchMock({
            headers: new Headers({
                ['Content-Type']: 'image/jpeg',
            }),
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        });
    });

    it('should store for file uploaded from local device to Onyx', async () => {
        // Given the attachment data consisting of name, type and uri
        const fileData = {
            name: `TEST_ATTACHMENT_FILE`,
            type: 'image/jpeg',
            uri: 'file://mock/documents/113134427695441775.jpg',
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
            source: `/mock/documents/${attachmentID}.jpg`,
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
            source: `/mock/documents/${attachmentID}.jpg`,
            remoteSource: sourceURL,
        });
    });
    it('should store/cache for old attachment file', async () => {
        // Given the attachment data consisting of name, type and uri
        const fileData = {
            name: `TEST_ATTACHMENT_FILE`,
            type: 'image/jpeg',
            uri: 'file://mock/documents/113134427695441775.jpg',
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

        const attachmentID = rand64();
        const attachment = attachments?.[`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`];
        getCachedAttachment(attachmentID, attachment, fileData.uri);

        await waitForBatchedUpdates();

        const updatedAttachment = attachments?.[`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`];
        // Then the attachment should be updated with new attachment
        expect(updatedAttachment).toEqual({
            attachmentID,
            source: `/mock/documents/${attachmentID}.jpg`,
        });
    });
    it('should store/cache for old markdown attachment', async () => {
        // Given the attachment data consisting of sourceURL and markdown comment text
        const sourceURL = 'https://images.unsplash.com/photo-1726066012751-2adfb5485977?w=500';

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

        const attachmentID = `${rand64()}_1`; // markdown attachment ID
        const attachment = attachments?.[`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`];
        getCachedAttachment(attachmentID, attachment, sourceURL);

        await waitForBatchedUpdates();

        const updatedAttachment = attachments?.[`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`];
        // Then the attachment should be updated with new attachment
        expect(updatedAttachment).toEqual({
            attachmentID,
            source: `/mock/documents/${attachmentID}.jpg`,
            remoteSource: sourceURL,
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
            source: `/mock/documents/${attachmentID}.jpg`,
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
            source: `/mock/documents/${attachmentID}.jpg`,
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
            source: `/mock/documents/${attachmentID}.jpg`,
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
            source: `/mock/documents/${attachmentID}.jpg`,
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
