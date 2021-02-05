import ShareMenu from 'react-native-share-menu';
import {redirect} from '../actions/App';
import {set as setSharedItem} from '../actions/SharedItem';
import ROUTES from '../../ROUTES';
import ShareType from './ShareType';

const TEXT_MIME_TYPE = /^text\//i;

// Share event listener
let listener;

/**
 * Prepare shared item for posting
 *
 * @param {Object} sharedItem Shared item object
 * @returns {Object} Prepared shared item structure
 */
function prepareSharedItem(sharedItem) {
    if (sharedItem.mimeType.match(TEXT_MIME_TYPE)) {
        // Shared item is text or HTML
        return {
            type: ShareType.TEXT,
            data: sharedItem.data,
        };
    }

    // Shared item is file attachment
    return {
        type: ShareType.FILE,
        data: {
            name: 'chat_attachment',
            type: sharedItem.mimeType,
            uri: sharedItem.data,
        },
    };
}

/**
 * Saves shared item and redirects to Share Page.
 *
 * @param {Object} sharedItem
 */
function handleShare(sharedItem) {
    if (sharedItem) {
        const preparedSharedItem = prepareSharedItem(sharedItem);
        setSharedItem(preparedSharedItem);
        redirect(ROUTES.SHARE);
    }
}

/**
 * Subscribes to share events.
 */
function register() {
    ShareMenu.getInitialShare(handleShare);
    listener = ShareMenu.addNewShareListener(handleShare);
}

/**
 * Removes share events listener.
 */
function deregister() {
    listener.remove();
}

export default {
    register,
    deregister,
    TYPE: ShareType,
};
