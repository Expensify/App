import Airship from '@ua/react-native-airship';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Unit} from '@src/types/onyx/Policy';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';

const ATTRIBUTES_TYPE = 'GpsTripAttributes';

let activityId: string | null = null;
let distanceUnit: Unit | null = null;

function startGpsTripNotification(translate: LocalizedTranslate, reportID: string, unit: Unit, distanceInMeters = 0) {
    const subtitle = translate('gps.liveActivity.subtitle');
    const buttonText = translate('gps.liveActivity.button');
    const distanceUnitLong = unit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES ? translate('common.miles') : translate('common.kilometers');

    const deepLink = ROUTES.DISTANCE_REQUEST_CREATE_TAB_GPS.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.CREATE, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID);

    let distance = 0;
    if (distanceInMeters !== undefined && distanceInMeters !== 0) {
        distance = DistanceRequestUtils.convertDistanceUnit(distanceInMeters, unit);
    }

    Airship.iOS.liveActivityManager
        .start({
            attributesType: ATTRIBUTES_TYPE,
            content: {
                state: {distance},
                relevanceScore: 100,
            },
            attributes: {deepLink, subtitle, distanceUnit: unit, distanceUnitLong, buttonText},
        })
        .then((activity) => {
            activityId = activity.id;
            distanceUnit = unit;
        })
        .catch((error: unknown) => console.error('[GPS Live Activity] Failed to start', error));
}

function updateGpsTripNotification(distanceInMeters: number) {
    if (activityId === null || distanceUnit === null) {
        console.error('[GPS Live Activity] Failed to start update: activityId or distanceUnit is null');
        return;
    }

    const distance = DistanceRequestUtils.convertDistanceUnit(distanceInMeters, distanceUnit);

    Airship.iOS.liveActivityManager
        .update({
            attributesType: ATTRIBUTES_TYPE,
            activityId,
            content: {
                state: {distance},
                relevanceScore: 100,
            },
        })
        .catch((error: unknown) => console.error('[GPS Live Activity] Failed to update', error));
}

function stopGpsTripNotification() {
    if (activityId === null) {
        return;
    }

    Airship.iOS.liveActivityManager
        .end({
            attributesType: ATTRIBUTES_TYPE,
            activityId,
            dismissalPolicy: {type: 'immediate'},
        })
        .catch((error: unknown) => console.error('[GPS Live Activity] Failed to end', error));

    activityId = null;
    distanceUnit = null;
}

async function checkAndCleanGpsNotification() {
    const liveActivities = await Airship.iOS.liveActivityManager.listAll();

    for (const liveActivity of liveActivities) {
        if (liveActivity.attributeTypes !== ATTRIBUTES_TYPE) {
            continue;
        }

        Airship.iOS.liveActivityManager
            .end({
                attributesType: ATTRIBUTES_TYPE,
                activityId: liveActivity.id,
                dismissalPolicy: {type: 'immediate'},
            })
            .catch((error: unknown) => console.error('[GPS Live Activity] Failed to end', error));
    }
}

export {startGpsTripNotification, updateGpsTripNotification, stopGpsTripNotification, checkAndCleanGpsNotification};
