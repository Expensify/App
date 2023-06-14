/**
 * Handle android native back button
 */
import Onyx from 'react-native-onyx';
import {BackHandler} from 'react-native';
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

function prepareBackHistory() {}

function backButtonHandler() {
    if (lastOpenedRoomId && lastOpenedRoomId !== '') {
        // Use deeplink implementation to change navigation stack
        Report.openReportFromDeepLink(ROUTES.getReportRoute(lastOpenedRoomId), false);
    } else {
        BackHandler.exitApp();
    }
    return true;
}

function addBackButtonListener() {
    BackHandler.addEventListener('hardwareBackPress', backButtonHandler);
}

function removeBackButtonListener() {
    BackHandler.removeEventListener('hardwareBackPress', backButtonHandler);
}

export {prepareBackHistory, backButtonHandler, addBackButtonListener, removeBackButtonListener};
