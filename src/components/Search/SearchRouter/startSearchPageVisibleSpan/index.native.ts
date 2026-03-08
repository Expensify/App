import {startSpan} from '@libs/telemetry/activeSpans';
import CONST from '@src/CONST';

function startSearchPageVisibleSpan() {
    startSpan(CONST.TELEMETRY.SPAN_SEARCH_PAGE_VISIBLE, {
        name: CONST.TELEMETRY.SPAN_SEARCH_PAGE_VISIBLE,
        op: CONST.TELEMETRY.SPAN_SEARCH_PAGE_VISIBLE,
    });
}

export default startSearchPageVisibleSpan;
