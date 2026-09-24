import type {LocationSource} from '@libs/getCurrentPosition/getCurrentPositionWithinCap';

import CONST from '@src/CONST';

import {getSpan} from './activeSpans';

function markSubmitExpenseLocationSource(source: LocationSource) {
    getSpan(CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE)?.setAttribute(CONST.TELEMETRY.ATTRIBUTE_LOCATION_SOURCE, source);
}

export default markSubmitExpenseLocationSource;
