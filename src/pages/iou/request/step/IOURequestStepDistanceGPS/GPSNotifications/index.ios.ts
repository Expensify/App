import Airship from '@ua/react-native-airship';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Unit} from '@src/types/onyx/Policy';

const ATTRIBUTES_TYPE = 'GpsTripAttributes';

let activityId: string | null = null;
let lastDistanceUnit: {unit: Unit; abbreviated: string; full: string} | null = null;
let lastDistanceInMeters: number | null = null;

function getDistanceUnitFull(translate: LocalizedTranslate, unit: Unit) {
    return unit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES ? translate('common.miles') : translate('common.kilometers');
}

function getDistanceUnitAbbreviated(translate: LocalizedTranslate, unit: Unit) {
    return unit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES ? translate('common.milesAbbreviated') : translate('common.kilometersAbbreviated');
}

function startGpsTripNotification(translate: LocalizedTranslate, reportID: string, unit: Unit, distanceInMeters = 0) {
    const subtitle = translate('gps.liveActivity.subtitle');
    const buttonText = translate('gps.liveActivity.button');

    lastDistanceUnit = {unit, abbreviated: getDistanceUnitAbbreviated(translate, unit), full: getDistanceUnitFull(translate, unit)};
    lastDistanceInMeters = distanceInMeters;

    const deepLink = ROUTES.DISTANCE_REQUEST_CREATE_TAB_GPS.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.CREATE, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID);

    const distance = DistanceRequestUtils.convertDistanceUnit(distanceInMeters, unit);

    Airship.iOS.liveActivityManager
        .start({
            attributesType: ATTRIBUTES_TYPE,
            content: {
                state: {distance, distanceUnit: lastDistanceUnit.abbreviated, distanceUnitLong: lastDistanceUnit.full},
                relevanceScore: 100,
            },
            attributes: {deepLink, subtitle, buttonText},
        })
        .then((activity) => {
            activityId = activity.id;
        })
        .catch((error: unknown) => console.error('[GPS Live Activity] Failed to start', error));
}

function updateGpsTripNotification(nonNullActivityId: string, distance: number, distanceUnit: string, distanceUnitLong: string) {
    Airship.iOS.liveActivityManager
        .update({
            attributesType: ATTRIBUTES_TYPE,
            activityId: nonNullActivityId,
            content: {
                state: {distance, distanceUnit, distanceUnitLong},
                relevanceScore: 100,
            },
        })
        .catch((error: unknown) => console.error('[GPS Live Activity] Failed to update', error));
}

function updateGpsTripNotificationDistance(distanceInMeters: number) {
    if (activityId === null || lastDistanceUnit === null) {
        console.error('[GPS Live Activity] Failed to start update: activityId or lastDistanceUnit is null');
        return;
    }

    lastDistanceInMeters = distanceInMeters;

    const distance = DistanceRequestUtils.convertDistanceUnit(distanceInMeters, lastDistanceUnit.unit);

    updateGpsTripNotification(activityId, distance, lastDistanceUnit.abbreviated, lastDistanceUnit.full);
}

function updateGpsTripNotificationUnit(translate: LocalizedTranslate, unit: Unit) {
    if (activityId === null || lastDistanceInMeters === null) {
        console.error('[GPS Live Activity] Failed to start update: activityId or lastDistanceInMeters is null');
        return;
    }

    // Update is not needed if the distance unit will stay the same
    if (lastDistanceUnit?.unit === unit) {
        return;
    }

    lastDistanceUnit = {unit, abbreviated: getDistanceUnitAbbreviated(translate, unit), full: getDistanceUnitFull(translate, unit)};

    const distance = DistanceRequestUtils.convertDistanceUnit(lastDistanceInMeters, unit);

    updateGpsTripNotification(activityId, distance, lastDistanceUnit.abbreviated, lastDistanceUnit.full);
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
    lastDistanceUnit = null;
    lastDistanceInMeters = null;
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

function shouldUpdateGpsNotificationUnit() {
    return activityId !== null;
}

export {startGpsTripNotification, updateGpsTripNotificationDistance, updateGpsTripNotificationUnit, stopGpsTripNotification, checkAndCleanGpsNotification, shouldUpdateGpsNotificationUnit};
