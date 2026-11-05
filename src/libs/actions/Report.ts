import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import * as API from './API';
import * as User from './User';

/**
 * Marks a chat as unread.
 *
 * @param reportID The ID of the report to mark as unread.
 */
function markChatAsUnread(reportID) {
    // Optimistically mark the chat as unread on the client
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
        lastReadTime: '0',
    });

    // Call the API to mark the chat as unread on the server
    API.markChatAsUnread({
        reportID,
    });
}

/**
 * Marks a chat as read.
 *
 * @param reportID The ID of the report to mark as read.
 */
function markChatAsRead(reportID) {
    // Get the current user's accountID
    const accountID = User.getAccountID();

    // Optimistically mark the chat as read on the client
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
        lastReadTime: new Date().toISOString(),
    });

    // Call the API to mark the chat as read on the server
    API.readNewestAction({
        reportID,
        lastReadTime: new Date().toISOString(),
        accountID,
    });
}

export default {
    markChatAsUnread,
    markChatAsRead,
};
