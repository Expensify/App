import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import {rand64} from '@libs/NumberUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type BulkAction from '@src/types/onyx/BulkAction';
import type {BulkActionType} from '@src/types/onyx/BulkAction';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

// bulkActionIDs this tab started during the current page load, so a bulk action started in another tab
// doesn't pop the modal open here until this tab reloads.
const locallyInitiatedBulkActionIDs = new Set<string>();

function wasBulkActionInitiatedLocally(bulkActionID: string): boolean {
    return locallyInitiatedBulkActionIDs.has(bulkActionID);
}

/** Starts a bulk action record that the backend moves to done once the action ran on every matching report */
function buildBulkActionOnyxData(action: BulkActionType) {
    const bulkActionID = rand64();
    locallyInitiatedBulkActionIDs.add(bulkActionID);
    const onyxKey = `${ONYXKEYS.COLLECTION.BULK_ACTION}${bulkActionID}` as const;

    const optimisticData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: onyxKey,
            value: {state: CONST.BULK_ACTION.STATE.RUNNING, action},
        },
    ];

    const failureData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: onyxKey,
            value: {state: CONST.BULK_ACTION.STATE.FAILED, action},
        },
    ];

    return {bulkActionID, onyxData: {optimisticData, failureData}};
}

function sendBulkActionSummaryFromConcierge(bulkActionID: string, bulkAction: OnyxEntry<BulkAction>) {
    const onyxKey = `${ONYXKEYS.COLLECTION.BULK_ACTION}${bulkActionID}` as const;

    const optimisticData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: onyxKey,
            value: {shouldSendFromConcierge: true},
        },
    ];

    const failureData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: onyxKey,
            value: {shouldSendFromConcierge: bulkAction?.shouldSendFromConcierge ?? null},
        },
    ];

    write(WRITE_COMMANDS.SEND_BULK_ACTION_SUMMARY_FROM_CONCIERGE, {bulkActionID}, {optimisticData, failureData});
}

function clearBulkAction(bulkActionID: string, bulkAction: OnyxEntry<BulkAction>) {
    locallyInitiatedBulkActionIDs.delete(bulkActionID);
    const onyxKey = `${ONYXKEYS.COLLECTION.BULK_ACTION}${bulkActionID}` as const;

    const optimisticData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: onyxKey,
            value: null,
        },
    ];

    const failureData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: onyxKey,
            value: bulkAction ?? null,
        },
    ];

    write(WRITE_COMMANDS.CLEAR_BULK_ACTION, {bulkActionID}, {optimisticData, failureData});
}

export {buildBulkActionOnyxData, sendBulkActionSummaryFromConcierge, clearBulkAction, wasBulkActionInitiatedLocally};
