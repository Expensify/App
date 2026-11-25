import type {TransformedImage} from '@libs/cameraCapture/types';
/** The capture transforms for receipt enhancement: the shutter capture, with its telemetry span, and the full-resolution upgrade photo. */
import {endSpanWithAttributes, getSpan, startSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';

import type {Image} from 'react-native-nitro-image';

import type {EnhancedReceipt} from './enhanceReceipt';

import enhanceReceipt, {UPGRADE_ENHANCE_TIMEOUT_MS} from './enhanceReceipt';
import documentReader from './readDocument';

function toTransformedImage(result: EnhancedReceipt): TransformedImage {
    return {image: result.outcome === CONST.TELEMETRY.ENHANCE_OUTCOME.CROPPED ? result.image : undefined, sourceReleased: result.sourceReleased};
}

function enhanceCapture(image: Image): Promise<TransformedImage> {
    const parentSpan = getSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION);
    startSpan(CONST.TELEMETRY.SPAN_RECEIPT_ENHANCE, {
        name: CONST.TELEMETRY.SPAN_RECEIPT_ENHANCE,
        op: CONST.TELEMETRY.SPAN_RECEIPT_ENHANCE,
        parentSpan,
        attributes: {[CONST.TELEMETRY.ATTRIBUTE_PLATFORM]: CONST.TELEMETRY.SPAN_PLATFORM.NATIVE},
    });
    return enhanceReceipt(image, documentReader.minConfidence).then((result) => {
        endSpanWithAttributes(CONST.TELEMETRY.SPAN_RECEIPT_ENHANCE, {
            [CONST.TELEMETRY.ATTRIBUTE_ENHANCE_OUTCOME]: result.outcome,
            [CONST.TELEMETRY.ATTRIBUTE_DETECT_DURATION_MS]: result.detectDurationMs,
            [CONST.TELEMETRY.ATTRIBUTE_WARP_DURATION_MS]: result.warpDurationMs,
        });
        parentSpan?.setAttributes({[CONST.TELEMETRY.ATTRIBUTE_RECEIPT_ENHANCED]: result.outcome === CONST.TELEMETRY.ENHANCE_OUTCOME.CROPPED});
        return toTransformedImage(result);
    });
}

function enhanceUpgradePhoto(image: Image): Promise<TransformedImage> {
    return enhanceReceipt(image, documentReader.minConfidence, UPGRADE_ENHANCE_TIMEOUT_MS).then(toTransformedImage);
}

export default enhanceCapture;
export {enhanceUpgradePhoto};
