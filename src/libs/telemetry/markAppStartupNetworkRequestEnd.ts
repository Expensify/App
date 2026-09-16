import isStartupNetworkRequest from '@libs/AppStartupNetworkRequest';

import CONST from '@src/CONST';

import {endSpanWithAttributes} from './activeSpans';

/** End the span for the app startup network request. */
function markAppStartupNetworkRequestEnd(command: string | undefined): void {
    if (!isStartupNetworkRequest(command)) {
        return;
    }

    endSpanWithAttributes(CONST.TELEMETRY.SPAN_APP_STARTUP_NETWORK_REQUEST, {
        [CONST.TELEMETRY.ATTRIBUTE_COMMAND]: command,
    });
}

export default markAppStartupNetworkRequestEnd;
