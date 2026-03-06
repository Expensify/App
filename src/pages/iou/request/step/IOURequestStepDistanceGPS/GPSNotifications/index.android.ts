import Airship from '@ua/react-native-airship';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Unit} from '@src/types/onyx/Policy';

const LIVE_UPDATE_NAME = 'gps_live_update';
const LIVE_UPDATE_TYPE = 'gps_trip_notification';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function startGpsTripNotification(translate: LocalizedTranslate, reportID: string, unit: Unit, distanceInMeters?: number) {
    const title = translate('gps.notification.title');
    const body = translate('gps.notification.body');
    const deepLink = ROUTES.DISTANCE_REQUEST_CREATE_TAB_GPS.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.CREATE, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID);

    Airship.android.liveUpdateManager
        .start({
            name: LIVE_UPDATE_NAME,
            type: LIVE_UPDATE_TYPE,
            content: {title, body, deepLink},
        })
        .catch((error: unknown) => console.error('[GPS Live Update] Failed to start', error));
}

function stopGpsTripNotification() {
    Airship.android.liveUpdateManager.end({name: LIVE_UPDATE_NAME}).catch((error: unknown) => console.error('[GPS Live Update] Failed to end', error));
}

async function checkAndCleanGpsNotification() {
    try {
        const liveUpdates = await Airship.android.liveUpdateManager.listAll();

        for (const liveUpdate of liveUpdates) {
            if (liveUpdate.name !== LIVE_UPDATE_NAME) {
                continue;
            }

            stopGpsTripNotification();
        }
    } catch (error) {
        console.error('[GPS Live Update] Failed to check live updates', error);
    }
}

export {startGpsTripNotification, stopGpsTripNotification, checkAndCleanGpsNotification};
