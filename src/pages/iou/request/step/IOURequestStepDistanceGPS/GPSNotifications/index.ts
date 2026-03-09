// Android and iOS only, no-op for other platforms
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {Unit} from '@src/types/onyx/Policy';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function startGpsTripNotification(_translate: LocalizedTranslate, _reportID: string, _unit: Unit, _distanceInMeters?: number) {}

function stopGpsTripNotification() {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function updateGpsTripNotification(_distanceInMeters: number) {}

async function checkAndCleanGpsNotification(): Promise<void> {
    // no-op
}

export {startGpsTripNotification, stopGpsTripNotification, updateGpsTripNotification, checkAndCleanGpsNotification};
