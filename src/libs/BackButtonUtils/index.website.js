/**
 * Handle android native back button
 */
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as Report from '../actions/Report';
import ROUTES from '../../ROUTES';

let lastOpenedRoomId;
Onyx.connect({
    key: ONYXKEYS.LAST_OPENED_PUBLIC_ROOM_ID,
    callback: (val) => {
        if (!val) {
            return;
        }
        lastOpenedRoomId = val;
    },
});

function prepareBackHistory(){
    if(!lastOpenedRoomId || lastOpenedRoomId ==='') {
        return
    }
    window.history.pushState({}, '', ROUTES.getReportRoute(lastOpenedRoomId));
}

function backButtonHandler() {
    if(lastOpenedRoomId && lastOpenedRoomId!==''){
        // Use deeplink implementation to change navigation stack
        Report.openReportFromDeepLink(ROUTES.getReportRoute(lastOpenedRoomId), false)
    }else{
        window.history.back();
    }
}

function addBackButtonListener(handler){
    window.addEventListener('popstate', handler);
}

function removeBackButtonListener(handler){
    window.removeEventListener('popstate', handler);
}

export {
    prepareBackHistory,
    backButtonHandler,
    addBackButtonListener,
    removeBackButtonListener,
};
