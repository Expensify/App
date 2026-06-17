import DateUtils from './DateUtils';

/**
 * Full reconnect: the app fetches all of its data from the server again.
 *
 * The server can ask for one by setting a cutoff time in the Onyx value
 * NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE. If the app last reconnected before that cutoff, its
 * data is stale. The app stores its own last reconnect time in LAST_FULL_RECONNECT_TIME. Both are
 * date strings from DateUtils.getDBTime(), which sort in the same order as the dates they represent,
 * so comparing them as strings is correct.
 */

/**
 * An empty last reconnect time means the app has never reconnected, so this returns true. An empty
 * cutoff means the server has not asked for one, so this returns false.
 */
function shouldTriggerFullReconnect(lastFullReconnectTime: string, serverReconnectCutoff: string): boolean {
    return lastFullReconnectTime < serverReconnectCutoff;
}

/**
 * The time to write to LAST_FULL_RECONNECT_TIME after a full reconnect. This is the current time, or
 * the server's cutoff if the cutoff is later.
 *
 * If this device's clock is behind the server, the current time can fall before the cutoff. The app
 * would then still read as stale, reconnect right away, and keep repeating. Using the later of the
 * two values stops that loop. A newer cutoff sent later is still greater, so it triggers the next
 * reconnect as normal.
 */
function getLastFullReconnectTimeToRecord(serverReconnectCutoff: string): string {
    const now = DateUtils.getDBTime();
    return now >= serverReconnectCutoff ? now : serverReconnectCutoff;
}

export {shouldTriggerFullReconnect, getLastFullReconnectTimeToRecord};
