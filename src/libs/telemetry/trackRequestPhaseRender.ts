import CONST from '@src/CONST';

import {endSpanWithAttributes, startSpan} from './activeSpans';

/** Longer frames mean the JS thread is still blocked by the render cascade. */
const RESPONSIVE_FRAME_BUDGET_MS = 32;

/** Two in a row, so a lucky gap between two long tasks does not read as "settled". */
const REQUIRED_HEALTHY_FRAMES = 2;

const MAX_WAIT_MS = 10_000;

/** Onyx resolves once subscribers are notified, before React renders, so the Apply phase cannot see this cascade. */
function trackRequestPhaseRender(spanName: string, command: string, attempt: number, requestID?: string): void {
    const spanId = `${spanName}_${attempt}`;
    const span = startSpan(spanId, {
        name: spanName,
        op: spanName,
        forceTransaction: true,
        attributes: {
            [CONST.TELEMETRY.ATTRIBUTE_COMMAND]: command,
            [CONST.TELEMETRY.ATTRIBUTE_ATTEMPT]: attempt,
            [CONST.TELEMETRY.ATTRIBUTE_REQUEST_ID]: requestID,
        },
    });

    if (!span) {
        return;
    }

    const startedAt = performance.now();
    let lastFrameAt = startedAt;
    let healthyFrames = 0;
    let longestFrameMs = 0;

    const onFrame = () => {
        const now = performance.now();
        const frameMs = now - lastFrameAt;
        lastFrameAt = now;
        longestFrameMs = Math.max(longestFrameMs, frameMs);
        healthyFrames = frameMs <= RESPONSIVE_FRAME_BUDGET_MS ? healthyFrames + 1 : 0;

        const hasTimedOut = now - startedAt >= MAX_WAIT_MS;
        if (healthyFrames < REQUIRED_HEALTHY_FRAMES && !hasTimedOut) {
            requestAnimationFrame(onFrame);
            return;
        }

        endSpanWithAttributes(spanId, {
            [CONST.TELEMETRY.ATTRIBUTE_LONGEST_FRAME_MS]: Math.round(longestFrameMs),
            [CONST.TELEMETRY.ATTRIBUTE_TIMED_OUT]: hasTimedOut,
        });
    };

    requestAnimationFrame(onFrame);
}

export default trackRequestPhaseRender;
