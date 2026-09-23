import {read} from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsDashboardID} from '@src/types/onyx';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/** Comparison mode asked for alongside the period on screen */
const PREVIOUS_PERIOD_COMPARE = 'previousPeriod';

/** How the mode reads inside the query string the command echoes back */
const PREVIOUS_PERIOD_COMPARE_FILTER = `compare:${PREVIOUS_PERIOD_COMPARE}`;

/**
 * Distance between a graph's two snapshot hashes. A placeholder: the counterpart hash belongs to the query over the
 * previous window, which the client will build once `compare` is part of the search grammar.
 */
const PREVIOUS_PERIOD_HASH_OFFSET = 1;

/** Names the snapshot each graph's previous period is stored under, which the command fills the way it fills the current one. */
function withPreviousPeriodHashes(insightsHashes: unknown): Record<string, unknown> | undefined {
    if (typeof insightsHashes !== 'object' || insightsHashes === null) {
        return undefined;
    }

    return Object.fromEntries(
        Object.entries(insightsHashes).map(([graphKey, graph]: [string, unknown]) => {
            if (typeof graph !== 'object' || graph === null || !('snapshotHash' in graph) || typeof graph.snapshotHash !== 'number') {
                return [graphKey, graph];
            }

            return [graphKey, {...graph, previousPeriodSnapshotHash: graph.snapshotHash + PREVIOUS_PERIOD_HASH_OFFSET}];
        }),
    );
}

/**
 * Asks the command for the period before the one on screen as well.
 *
 * Written straight onto the payload because `compare` is not part of the search grammar yet. Once it is, the mode
 * travels inside the query the way the type and the group-by do, and the hashes come from the query over that window.
 */
function withPreviousPeriodCompare(jsonQuery: string): string {
    const payload: unknown = JSON.parse(jsonQuery);
    if (typeof payload !== 'object' || payload === null) {
        return jsonQuery;
    }
    // The command reads the mode off the root key and off the query it was asked with, so both carry it.
    const inputQuery = 'inputQuery' in payload && typeof payload.inputQuery === 'string' ? `${payload.inputQuery} ${PREVIOUS_PERIOD_COMPARE_FILTER}` : undefined;
    const insightsHashes = 'insightsHashes' in payload ? withPreviousPeriodHashes(payload.insightsHashes) : undefined;

    return JSON.stringify({
        ...payload,
        ...(!!inputQuery && {inputQuery}),
        ...(!!insightsHashes && {insightsHashes}),
        compare: PREVIOUS_PERIOD_COMPARE,
    });
}

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

    read(READ_COMMANDS.GET_INSIGHTS, {jsonQuery: withPreviousPeriodCompare(jsonQuery)}, {optimisticData, failureData});
}

// eslint-disable-next-line import/prefer-default-export
export {getInsights};
