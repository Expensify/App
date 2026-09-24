import type {LocationSource} from '@libs/getCurrentPosition/getCurrentPositionWithinCap';

import CONST from '@src/CONST';

import {getSpan} from './activeSpans';

/**
 * Record on the open submit-expense span how the expense got its coordinates, so a submit that skipped the device can
 * be told apart from one that waited on it. No-op once the span has ended, so stamp before marking the submit ended.
 */
function markSubmitExpenseLocationSource(source: LocationSource) {
    getSpan(CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE)?.setAttribute(CONST.TELEMETRY.ATTRIBUTE_LOCATION_SOURCE, source);
}

export default markSubmitExpenseLocationSource;
