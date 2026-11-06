import CONST from '@src/CONST';

import {startSpan} from './activeSpans';

/**
 * Starts timing how long the category picker takes to show its list, from the tap that opens it. CategoryPicker ends
 * the span once its list renders, or cancels it if the picker closes first.
 */
function startOpenCategoryPickerSpan() {
    startSpan(CONST.TELEMETRY.SPAN_OPEN_CATEGORY_PICKER, {
        name: CONST.TELEMETRY.SPAN_OPEN_CATEGORY_PICKER,
        op: CONST.TELEMETRY.SPAN_OPEN_CATEGORY_PICKER,
    });
}

export default startOpenCategoryPickerSpan;
