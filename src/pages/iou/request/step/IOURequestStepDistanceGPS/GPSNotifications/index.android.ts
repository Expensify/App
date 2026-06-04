import {NativeModules} from 'react-native';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Unit} from '@src/types/onyx/Policy';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function startGpsTripNotification(translate: LocalizedTranslate, reportID: string, unit: Unit, distanceInMeters?: number) {
    const title = translate('gps.notification.title');
    const body = translate('gps.notification.body');
    const deepLink = ROUTES.DISTANCE_REQUEST_CREATE_TAB_GPS.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.CREATE, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID);

    NativeModules.GpsTripServiceModule.startService(title, body, deepLink);
}

function stopGpsTripNotification() {
    NativeModules.GpsTripServiceModule.stopService();
}

function checkAndCleanGpsNotification() {
    NativeModules.GpsTripServiceModule.stopService();
}

function shouldUpdateGpsNotificationUnit() {
    return false;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function updateGpsTripNotificationDistance(_distanceInMeters: number) {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function updateGpsTripNotificationUnit(_translate: LocalizedTranslate, _unit: Unit) {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function updateGpsTripNotificationLanguage(_translate: LocalizedTranslate) {}

export {
    startGpsTripNotification,
    stopGpsTripNotification,
    updateGpsTripNotificationDistance,
    updateGpsTripNotificationUnit,
    updateGpsTripNotificationLanguage,
    checkAndCleanGpsNotification,
    shouldUpdateGpsNotificationUnit,
};
