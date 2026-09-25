import {read} from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsDashboardID} from '@src/types/onyx';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

function getInsights(dashboard: InsightsDashboardID, hash: number, jsonQuery: string, snapshotHashes: number[]) {
    const key = `${ONYXKEYS.COLLECTION.INSIGHTS}${dashboard}_${hash}` as const;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.INSIGHTS | typeof ONYXKEYS.COLLECTION.SNAPSHOT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key,
            value: {
                errors: null,
            },
        },
        ...snapshotHashes.map<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SNAPSHOT>>((snapshotHash) => ({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}`,
            value: {
                errors: null,
                search: {responseJsonCode: null},
            },
        })),
    ];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.INSIGHTS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key,
            value: {
                errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
            },
        },
    ];

    const finallyData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SNAPSHOT>> = snapshotHashes.map((snapshotHash) => ({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}`,
        value: {
            search: {state: CONST.SEARCH.SNAPSHOT_STATE.LOADED, type: CONST.SEARCH.DATA_TYPES.EXPENSE, hash: snapshotHash},
        },
    }));

    read(READ_COMMANDS.GET_INSIGHTS, {jsonQuery}, {optimisticData, failureData, finallyData});
}

// eslint-disable-next-line import/prefer-default-export
export {getInsights};
