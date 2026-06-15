import DateUtils from './DateUtils';

/**
 * Whether a full reconnect should fire: the receipt (LAST_FULL_RECONNECT_TIME) is older than the
 * server's demand (NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE). Both are Onyx DB-time strings, so
 * lexicographic comparison is correct — an empty receipt always triggers, an empty demand never does.
 */
function shouldTriggerFullReconnect(lastFullReconnectTime: string, reconnectAppIfFullReconnectBefore: string): boolean {
    return lastFullReconnectTime < reconnectAppIfFullReconnectBefore;
}

/**
 * The receipt value to write when answering an NVP full-reconnect demand: max(client-now, demand).
 *
 * Plain client-now is unsafe. Every OpenApp/full-ReconnectApp response re-delivers the NVP before
 * writing the receipt, so on a client whose clock is behind the server the receipt always compares
 * below the NVP and re-triggers subscribeToFullReconnect — a storm at round-trip pace. Seeding to
 * the demand closes the loop; a genuinely newer NVP still compares above and triggers a fresh one.
 */
function getFullReconnectSeedTime(reconnectAppIfFullReconnectBefore: string): string {
    const now = DateUtils.getDBTime();
    return now >= reconnectAppIfFullReconnectBefore ? now : reconnectAppIfFullReconnectBefore;
}

export {shouldTriggerFullReconnect, getFullReconnectSeedTime};
