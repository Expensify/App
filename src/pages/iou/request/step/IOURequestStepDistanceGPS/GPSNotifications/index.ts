// Android and iOS only, no-op for other platforms
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {Unit} from '@src/types/onyx/Policy';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function startGpsTripNotification(_translate: LocalizedTranslate, _reportID: string, _unit: Unit, _distanceInMeters?: number) {}

function stopGpsTripNotification() {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function updateGpsTripNotificationDistance(_distanceInMeters: number) {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function updateGpsTripNotificationUnit(_translate: LocalizedTranslate, _unit: Unit) {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function updateGpsTripNotificationLanguage(_translate: LocalizedTranslate) {}

async function checkAndCleanGpsNotification(): Promise<void> {
    // no-op
}

function shouldUpdateGpsNotificationUnit(): boolean {
    return false;
}

export {
    startGpsTripNotification,
    stopGpsTripNotification,
    updateGpsTripNotificationDistance,
    updateGpsTripNotificationUnit,
    updateGpsTripNotificationLanguage,
    checkAndCleanGpsNotification,
    shouldUpdateGpsNotificationUnit,
};
