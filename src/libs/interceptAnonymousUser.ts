import {InteractionManager} from 'react-native';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {isAnonymousUser, signOutAndRedirectToSignIn} from './actions/Session';

function interceptAnonymousUser(callback: () => void, isAnonymousAction = false) {
    if (isAnonymousUser() && !isAnonymousAction) {
        hideContextMenu(false);
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            signOutAndRedirectToSignIn();
        });
    } else {
        callback();
    }
}

export default interceptAnonymousUser;
