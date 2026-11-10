/** Decides whether a Details panel section shows its data, a skeleton, the offline state, or an error. */
import CONST from '@src/CONST';

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

    /** JSON code stored with the errors, which tells a request that got no response from a backend error */
    responseJsonCode: number | undefined;
};

/** Returns what a section shows. Offline, data already loaded stays on screen. */
function getInsightsDetailsSectionState({isOffline, isLoaded, hasErrors, responseJsonCode}: GetInsightsDetailsSectionStateParams): InsightsDetailsSectionState {
    if (isOffline && (!isLoaded || hasErrors)) {
        return INSIGHTS_DETAILS_SECTION_STATE.OFFLINE;
    }
    if (hasErrors) {
        return responseJsonCode === CONST.JSON_CODE.NO_RESPONSE ? INSIGHTS_DETAILS_SECTION_STATE.STALE : INSIGHTS_DETAILS_SECTION_STATE.ERROR;
    }
    return isLoaded ? INSIGHTS_DETAILS_SECTION_STATE.READY : INSIGHTS_DETAILS_SECTION_STATE.LOADING;
}

export {getInsightsDetailsSectionState, INSIGHTS_DETAILS_SECTION_STATE};
export type {InsightsDetailsSectionState};
