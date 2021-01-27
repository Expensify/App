import ShareMenu from 'react-native-share-menu';
import Onyx from 'react-native-onyx';
import {redirect} from '../actions/App';
import ROUTES from '../../ROUTES';
import ONYXKEYS from '../../ONYXKEYS';
import ShareType from './ShareType';

// Share event listener
let listener;

function handleShare(sharedItem) {
    if (sharedItem) {
        Onyx.set(ONYXKEYS.SHARED_ITEM, sharedItem);
        redirect(ROUTES.SHARE);
    }
}

function register() {
    ShareMenu.getInitialShare(handleShare);
    listener = ShareMenu.addNewShareListener(handleShare);
}

function deregister() {
    listener.remove();
}

export default {
    register,
    deregister,
    TYPE: ShareType,
};
