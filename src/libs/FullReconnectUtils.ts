import DateUtils from './DateUtils';

/**
 * The single authoritative decision for whether a full reconnect should fire. Both values are
 * Onyx DB-time strings ("yyyy-MM-dd HH:mm:ss"), so plain lexicographic comparison is correct.
 *
 * Fires when the last full reconnect receipt (LAST_FULL_RECONNECT_TIME) is older than the
 * server's demand (NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE). An empty receipt (fresh install)
 * triggers against any non-empty demand; an empty demand never triggers.
 */
function shouldTriggerFullReconnect(lastFullReconnectTime: string, reconnectAppIfFullReconnectBefore: string): boolean {
    return lastFullReconnectTime < reconnectAppIfFullReconnectBefore;
}

/**
 * Computes the value to write to LAST_FULL_RECONNECT_TIME when answering an NVP full-reconnect
 * demand: the lexicographic max of client-now and the demand being answered.
 *
 * Plain client-now is NOT safe here. The NVP carries a server timestamp, and every
 * OpenApp/full-ReconnectApp response re-delivers it in response.onyxData, which
 * applyHTTPSOnyxUpdates applies before successData (see clearOnyxAndSeedFullReconnect for the
 * same ordering rationale). On a device whose clock is behind the server, a client-now receipt
 * always compares below the NVP, so each receipt write re-triggers subscribeToFullReconnect and
 * fires another full reconnect — a self-sustaining storm at round-trip pace. Raising the receipt
 * to the answered NVP closes that loop in every clock regime, while a genuinely newer NVP still
 * compares above the receipt and legitimately triggers a fresh reconnect.
 *
 * Both write sites of the receipt (the optimistic seed in subscribeToFullReconnect and the
 * command's successData) must derive their value from this helper — if they drift apart, the
 * clock-skew hole silently re-opens.
 */
function getFullReconnectSeedTime(reconnectAppIfFullReconnectBefore: string): string {
    const now = DateUtils.getDBTime();
    return now >= reconnectAppIfFullReconnectBefore ? now : reconnectAppIfFullReconnectBefore;
}

export {shouldTriggerFullReconnect, getFullReconnectSeedTime};
