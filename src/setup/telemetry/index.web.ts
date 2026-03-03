import {startSpan} from '@libs/telemetry/activeSpans';
import CONST from '@src/CONST';
import setupSentry from './setupSentry';

export default function (): void {
    setupSentry();

    startSpan(CONST.TELEMETRY.SPAN_APP_STARTUP, {
        name: CONST.TELEMETRY.SPAN_APP_STARTUP,
        op: CONST.TELEMETRY.SPAN_APP_STARTUP,
    });
}
