// Android and iOS only, no-op for other platforms
import type {LocalizedTranslate} from '@components/LocaleContextProvider';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function startGpsTripNotification(_translate: LocalizedTranslate, _reportID: string) {}

function stopGpsTripNotification() {}

async function checkAndCleanGpsNotification(): Promise<void> {
    // no-op
}

export {startGpsTripNotification, stopGpsTripNotification, checkAndCleanGpsNotification};
