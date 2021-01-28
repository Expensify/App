import ShareMenu from 'react-native-share-menu';
import {redirect} from '../actions/App';
import {set as setSharedItem} from '../actions/SharedItem';
import ROUTES from '../../ROUTES';
import ShareType from './ShareType';

// Share event listener
let listener;

/**
 * Prepares shared item and redirect to Share Page.
 *
 * @param {Object} sharedItem
 */
function handleShare(sharedItem) {
    if (sharedItem) {
        setSharedItem(sharedItem);
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
