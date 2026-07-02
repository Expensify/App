import {getOdometerImageName, getOdometerImageType, getOdometerImageUri} from '@libs/OdometerUtils';
import stitchOdometerImages from '@libs/stitchOdometerImages';
import {cancelSpan, endSpan, startSpan} from '@libs/telemetry/activeSpans';
import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';

type StitchTaskArgs = {
    startImage: FileObject | string;
    endImage: FileObject | string;
    signal?: AbortSignal;
};

type StitchTaskResult = {uri: string; name: string; type: string | undefined};

/**
 * Wraps `stitchOdometerImages` with optional abort-signal cancellation and a balanced
 * `SPAN_ODOMETER_IMAGE_STITCH` telemetry span lifecycle.
 *
 * Span contract: starts once on entry, ends exactly once on success, cancels exactly once on any
 * other path (abort, empty result, underlying rejection). Callers don't manage the span.
 *
 * Cancellation contract: `stitchOdometerImages` doesn't accept a signal, so an in-flight canvas
 * op runs to completion before this function observes the abort. Callers should treat a rejection
 * with `signal.aborted === true` as a cancellation, not a real failure.
 */
async function stitchTask({startImage, endImage, signal}: StitchTaskArgs): Promise<StitchTaskResult> {
    startSpan(CONST.TELEMETRY.SPAN_ODOMETER_IMAGE_STITCH, {
        name: CONST.TELEMETRY.SPAN_ODOMETER_IMAGE_STITCH,
        op: CONST.TELEMETRY.SPAN_ODOMETER_IMAGE_STITCH,
    });

    let spanEnded = false;
    try {
        if (signal?.aborted) {
            throw new Error('stitchTask aborted before start');
        }
        const stitchedImage = await stitchOdometerImages(startImage, endImage);
        if (signal?.aborted) {
            throw new Error('stitchTask aborted after stitchOdometerImages resolved');
        }
        if (!stitchedImage) {
            throw new Error('stitchOdometerImages returned no result');
        }
        endSpan(CONST.TELEMETRY.SPAN_ODOMETER_IMAGE_STITCH);
        spanEnded = true;
        return {
            uri: getOdometerImageUri(stitchedImage),
            name: getOdometerImageName(stitchedImage),
            type: getOdometerImageType(stitchedImage),
        };
    } finally {
        if (!spanEnded) {
            cancelSpan(CONST.TELEMETRY.SPAN_ODOMETER_IMAGE_STITCH);
        }
    }
}

export default stitchTask;
