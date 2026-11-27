/**
 * Maps the result of the native Entrust IDV SDK to the payload the backend expects from native clients, which is the shape
 * the previous native Onfido SDK returned.
 */

import type {NativeOnfidoResult} from '@components/Onfido/types';

import CONST from '@src/CONST';

import type {CaptureResult} from '@entrust.corporation/idvsdk-reactnative/callbacks/complete';
import type {ValueOf} from 'type-fest';

import {StepNames} from '@entrust.corporation/idvsdk-reactnative/steps/Step';

import Log from './Log';

/**
 * The SDK's TypeScript type says document sides are a `{front, back}` object, but the native SDKs send an array
 * (`List<DocumentSide>` on Android, `[DocumentSide]` on iOS) that the JS wrapper only runs `JSON.parse` on.
 */
type NativeDocumentSide = {
    type: ValueOf<typeof CONST.ONFIDO.NATIVE_DOCUMENT_SIDE>;
    id: string;
};

function convertEntrustResultToOnfidoPayload(result: Record<string, CaptureResult>): NativeOnfidoResult {
    const nativeResult: NativeOnfidoResult = {};
    for (const captureResult of Object.values(result)) {
        if (captureResult.type === StepNames.Document) {
            const sides = Array.isArray(captureResult.sides) ? (captureResult.sides as NativeDocumentSide[]) : [];
            const front = sides.find((side) => side.type === CONST.ONFIDO.NATIVE_DOCUMENT_SIDE.FRONT);
            const back = sides.find((side) => side.type === CONST.ONFIDO.NATIVE_DOCUMENT_SIDE.BACK);
            if (front) {
                nativeResult.document = {
                    front: {id: front.id},
                    back: back ? {id: back.id} : undefined,
                };
            }
        } else if (captureResult.type === StepNames.FaceVideo) {
            nativeResult.face = {
                id: captureResult.id,
                variant: CONST.ONFIDO.NATIVE_FACE_VARIANT.VIDEO,
            };
        }
    }

    // The backend can't verify the user without both parts, and a missing face falls back to the photo report, which fails the check
    if (!nativeResult.document || !nativeResult.face) {
        Log.hmmm('Onfido native result is missing the document or the face', {
            stepTypes: Object.values(result).map((captureResult) => captureResult.type),
            hasDocument: !!nativeResult.document,
            hasFace: !!nativeResult.face,
        });
    }

    return nativeResult;
}

export default convertEntrustResultToOnfidoPayload;
