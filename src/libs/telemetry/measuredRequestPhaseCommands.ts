import {READ_COMMANDS} from '@libs/API/types';
import isStartupNetworkRequest from '@libs/AppStartupNetworkRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import OnyxKeys from 'react-native-onyx/dist/OnyxKeys';

/**
 * Separate names per command so a new one doesn't dilute an existing metric's history in Sentry.
 * Keep this list short: every command here emits several spans per request.
 */
function getRequestPhaseSpanNames(command?: string) {
    if (isStartupNetworkRequest(command)) {
        return CONST.TELEMETRY.SPAN_STARTUP_DATA;
    }
    if (command === READ_COMMANDS.SEARCH) {
        return CONST.TELEMETRY.SPAN_SEARCH_DATA;
    }
    return undefined;
}

function getRequestPhaseApplyAttributes<TKey extends OnyxKey>(command: string, requestData: Record<string, unknown> | undefined, response: Response<TKey> | void) {
    if (command !== READ_COMMANDS.SEARCH) {
        return {};
    }
    const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${String(requestData?.hash)}`;
    const snapshot = response?.onyxData?.find((update) => update.key === snapshotKey)?.value;
    const snapshotData = snapshot && typeof snapshot === 'object' && 'data' in snapshot ? snapshot.data : undefined;
    return {
        [CONST.TELEMETRY.ATTRIBUTE_SEARCH_SNAPSHOT_COUNT]: OnyxKeys.getMembersOfCollection(ONYXKEYS.COLLECTION.SNAPSHOT)?.size ?? 0,
        [CONST.TELEMETRY.ATTRIBUTE_SEARCH_SNAPSHOT_ENTRIES]: snapshotData && typeof snapshotData === 'object' ? Object.keys(snapshotData).length : undefined,
    };
}

const attemptsBySpanName = new Map<string, number>();

/** Counted per span name rather than globally, so a concurrent Search never shifts the attempt numbers a startup span reports. */
function getNextRequestPhaseAttempt(spanName: string) {
    const attempt = (attemptsBySpanName.get(spanName) ?? 0) + 1;
    attemptsBySpanName.set(spanName, attempt);
    return attempt;
}

export default getRequestPhaseSpanNames;
export {getNextRequestPhaseAttempt, getRequestPhaseApplyAttributes};
