import {makeRequestWithSideEffects, waitForWrites} from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import Log from '@libs/Log';

import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsDashboardID} from '@src/types/onyx';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/** Dashboard entries with a request out, so one set of filters is never fetched twice at the same time. */
const inFlightInsightsRequests = new Set<string>();

function getInsights(dashboard: InsightsDashboardID, hash: number, jsonQuery: string) {
    const key = `${ONYXKEYS.COLLECTION.INSIGHTS}${dashboard}_${hash}` as const;
    if (inFlightInsightsRequests.has(key)) {
        return;
    }
    inFlightInsightsRequests.add(key);

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.INSIGHTS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key,
            value: {
                errors: null,
            },
        },
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

    waitForWrites(SIDE_EFFECT_REQUEST_COMMANDS.GET_INSIGHTS)
        .then(() => makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.GET_INSIGHTS, {jsonQuery}, {optimisticData, failureData}))
        .catch(async (error: unknown) => {
            // A network-level rejection (no HTTP response at all, e.g. offline/timeout) never reaches
            // SaveResponseInOnyx, so nothing else applies failureData for it, leaving a first load with no data
            // and no error to show for it.
            await Onyx.update(failureData);
            Log.hmmm('[Insights] GetInsights request failed', {error: String(error)});
        })
        .finally(() => {
            inFlightInsightsRequests.delete(key);
        });
}

// eslint-disable-next-line import/prefer-default-export
export {getInsights};
