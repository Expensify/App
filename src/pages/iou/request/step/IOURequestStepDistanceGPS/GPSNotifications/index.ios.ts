import Airship from '@ua/react-native-airship';
import type {JsonObject} from '@ua/react-native-airship';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Unit} from '@src/types/onyx/Policy';

const ATTRIBUTES_TYPE = 'GpsTripAttributes';

let activityId: string | null = null;

type GpsLiveActivityState = {
    distanceUnit: Unit;
    distanceUnitFull: string;
    distanceUnitAbbreviated: string;
    buttonText: string;
    subtitle: string;
    distanceInMeters: number;
    lockScreenBadgeText: string;
    lockScreenTrackingText: string;
};

let liveActivityState: GpsLiveActivityState | null = null;

function getDistanceUnitFull(translate: LocalizedTranslate, unit: Unit) {
    return unit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES ? translate('common.miles') : translate('common.kilometers');
}

function getDistanceUnitAbbreviated(translate: LocalizedTranslate, unit: Unit) {
    return unit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES ? translate('common.milesAbbreviated') : translate('common.kilometersAbbreviated');
}

function getLiveActivityUpdateState(distance: number, state: GpsLiveActivityState): JsonObject {
    return {
        distance,
        distanceUnit: state.distanceUnitAbbreviated,
        distanceUnitLong: state.distanceUnitFull,
        subtitle: state.subtitle,
        buttonText: state.buttonText,
        lockScreenBadgeText: state.lockScreenBadgeText,
        lockScreenTrackingText: state.lockScreenTrackingText,
    };
}

function startGpsTripNotification(translate: LocalizedTranslate, reportID: string, unit: Unit, distanceInMeters = 0) {
    liveActivityState = {
        subtitle: translate('gps.liveActivity.subtitle'),
        buttonText: translate('gps.liveActivity.button'),
        lockScreenBadgeText: translate('gps.liveActivity.lockScreenBadgeText'),
        lockScreenTrackingText: translate('gps.liveActivity.lockScreenTrackingText'),
        distanceUnit: unit,
        distanceUnitFull: getDistanceUnitFull(translate, unit),
        distanceUnitAbbreviated: getDistanceUnitAbbreviated(translate, unit),
        distanceInMeters,
    };

    const deepLink = ROUTES.DISTANCE_REQUEST_CREATE_TAB_GPS.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.CREATE, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID);

    const distance = DistanceRequestUtils.convertDistanceUnit(distanceInMeters, unit);

    Airship.iOS.liveActivityManager
        .start({
            attributesType: ATTRIBUTES_TYPE,
            content: {
                state: getLiveActivityUpdateState(distance, liveActivityState),
                relevanceScore: 100,
            },
            attributes: {deepLink},
        })
        .then((activity) => {
            activityId = activity.id;
        })
        .catch((error: unknown) => console.error('[GPS Live Activity] Failed to start', error));
}

function updateGpsTripNotification(nonNullActivityId: string, distance: number, state: GpsLiveActivityState) {
    Airship.iOS.liveActivityManager
        .update({
            attributesType: ATTRIBUTES_TYPE,
            activityId: nonNullActivityId,
            content: {
                state: getLiveActivityUpdateState(distance, state),
                relevanceScore: 100,
            },
        })
        .catch((error: unknown) => console.error('[GPS Live Activity] Failed to update', error));
}

function updateGpsTripNotificationDistance(distanceInMeters: number) {
    if (activityId === null || liveActivityState === null) {
        console.error('[GPS Live Activity] Failed to start update: activityId or liveActivityState is null');
        return;
    }

    liveActivityState.distanceInMeters = distanceInMeters;

    const distance = DistanceRequestUtils.convertDistanceUnit(distanceInMeters, liveActivityState.distanceUnit);

    updateGpsTripNotification(activityId, distance, liveActivityState);
}

function updateGpsTripNotificationUnit(translate: LocalizedTranslate, unit: Unit) {
    if (activityId === null || liveActivityState === null) {
        console.error('[GPS Live Activity] Failed to start update: activityId or liveActivityState is null');
        return;
    }

    // Update is not needed if the distance unit will stay the same
    if (liveActivityState.distanceUnit === unit) {
        return;
    }

    liveActivityState.distanceUnit = unit;
    liveActivityState.distanceUnitAbbreviated = getDistanceUnitAbbreviated(translate, unit);
    liveActivityState.distanceUnitFull = getDistanceUnitFull(translate, unit);

    const distance = DistanceRequestUtils.convertDistanceUnit(liveActivityState.distanceInMeters, unit);

    updateGpsTripNotification(activityId, distance, liveActivityState);
}

function updateGpsTripNotificationLanguage(translate: LocalizedTranslate) {
    if (activityId === null || liveActivityState === null) {
        console.error('[GPS Live Activity] Failed to start update: activityId or liveActivityState is null');
        return;
    }

    const unit = liveActivityState.distanceUnit;

    liveActivityState.distanceUnitAbbreviated = getDistanceUnitAbbreviated(translate, unit);
    liveActivityState.distanceUnitFull = getDistanceUnitFull(translate, unit);
    liveActivityState.subtitle = translate('gps.liveActivity.subtitle');
    liveActivityState.buttonText = translate('gps.liveActivity.button');
    liveActivityState.lockScreenBadgeText = translate('gps.liveActivity.lockScreenBadgeText');
    liveActivityState.lockScreenTrackingText = translate('gps.liveActivity.lockScreenTrackingText');

    const distance = DistanceRequestUtils.convertDistanceUnit(liveActivityState.distanceInMeters, unit);

    updateGpsTripNotification(activityId, distance, liveActivityState);
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
    liveActivityState = null;
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

export {
    startGpsTripNotification,
    updateGpsTripNotificationDistance,
    updateGpsTripNotificationUnit,
    updateGpsTripNotificationLanguage,
    stopGpsTripNotification,
    checkAndCleanGpsNotification,
    shouldUpdateGpsNotificationUnit,
};
