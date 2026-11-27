/** Decides whether a Details panel section shows its data, a skeleton, the offline state, or an error. */
import CONST from '@src/CONST';
import type {InsightsBiggestChangesGroupBy, InsightsDetails} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

const INSIGHTS_DETAILS_SECTION_STATE = {
    READY: 'ready',
    LOADING: 'loading',
    STALE: 'stale',
    ERROR: 'error',
    OFFLINE: 'offline',
} as const;

type InsightsDetailsSectionState = ValueOf<typeof INSIGHTS_DETAILS_SECTION_STATE>;

type GetInsightsDetailsSectionStateParams = {
    isOffline: boolean;
    isLoaded: boolean;
    hasErrors: boolean;

    /** JSON code stored with the errors, to tell apart requests that got no response from backend errors */
    responseJsonCode: number | undefined;
};

/** Returns which state a section should show. When offline, data that's already loaded stays on screen */
function getInsightsDetailsSectionState({isOffline, isLoaded, hasErrors, responseJsonCode}: GetInsightsDetailsSectionStateParams): InsightsDetailsSectionState {
    if (isOffline && (!isLoaded || hasErrors)) {
        return INSIGHTS_DETAILS_SECTION_STATE.OFFLINE;
    }
    if (hasErrors) {
        return responseJsonCode === CONST.JSON_CODE.NO_RESPONSE ? INSIGHTS_DETAILS_SECTION_STATE.STALE : INSIGHTS_DETAILS_SECTION_STATE.ERROR;
    }
    return isLoaded ? INSIGHTS_DETAILS_SECTION_STATE.READY : INSIGHTS_DETAILS_SECTION_STATE.LOADING;
}

/** States of the sections GetInsightsDetails fills, each loaded once its own data has arrived */
type InsightsDetailsSectionStates = {
    /** Whether the request failed, which every section shares */
    hasErrors: boolean;

    summary: InsightsDetailsSectionState;
    recentHistory: InsightsDetailsSectionState;
    biggestChanges: InsightsDetailsSectionState;
};

/** Returns the state of each section GetInsightsDetails fills. They share the request's errors, and Biggest changes is loaded once the picked grouping has arrived. */
function getInsightsDetailsSectionStates(details: OnyxEntry<InsightsDetails>, isOffline: boolean, biggestChangesGroupBy: InsightsBiggestChangesGroupBy): InsightsDetailsSectionStates {
    const hasErrors = !isEmptyObject(details?.errors);
    const getState = (isLoaded: boolean) => getInsightsDetailsSectionState({isOffline, isLoaded, hasErrors, responseJsonCode: details?.responseJsonCode});
    return {
        hasErrors,
        summary: getState(details?.summary !== undefined),
        recentHistory: getState(details?.recentHistory !== undefined),
        biggestChanges: getState(details?.biggestChanges?.[biggestChangesGroupBy] !== undefined),
    };
}

export {getInsightsDetailsSectionState, getInsightsDetailsSectionStates, INSIGHTS_DETAILS_SECTION_STATE};
export type {InsightsDetailsSectionState};
