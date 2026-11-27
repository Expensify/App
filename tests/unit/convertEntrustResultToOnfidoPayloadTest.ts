import convertEntrustResultToOnfidoPayload from '@libs/convertEntrustResultToOnfidoPayload';
import Log from '@libs/Log';

import CONST from '@src/CONST';

import type {CaptureResult} from '@entrust.corporation/idvsdk-reactnative/callbacks/complete';

// Native results are built here as the native SDKs send them: document sides are an array of `{type, id, videoId}`,
// not the `{front, back}` object the SDK's TypeScript type describes, so the cast is intentional.
function buildResult(result: Record<string, unknown>): Record<string, CaptureResult> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the native shape differs from the SDK's type on purpose, see above
    return result as Record<string, CaptureResult>;
}

const FACE_VIDEO = {type: 'faceVideo', id: 'face-video-id'};

describe('convertEntrustResultToOnfidoPayload', () => {
    let hmmmSpy: jest.SpyInstance;

    beforeEach(() => {
        hmmmSpy = jest.spyOn(Log, 'hmmm').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('maps a US driving license with both sides and a face video', () => {
        // Given a native result for a US driver's license, which has a front and a back, and a face video
        const result = buildResult({
            document: {
                type: 'document',
                countryCode: 'USA',
                sides: [
                    {type: 'front', id: 'front-id', videoId: 'front-video-id'},
                    {type: 'back', id: 'back-id', videoId: 'back-video-id'},
                ],
            },
            faceVideo: FACE_VIDEO,
        });

        // When it is mapped to the payload the backend expects
        const nativeResult = convertEntrustResultToOnfidoPayload(result);

        // Then both document sides and the video face variant are sent, because the backend needs all of them to verify the user
        expect(nativeResult).toEqual({
            document: {front: {id: 'front-id'}, back: {id: 'back-id'}},
            face: {id: 'face-video-id', variant: CONST.ONFIDO.NATIVE_FACE_VARIANT.VIDEO},
        });
        expect(hmmmSpy).not.toHaveBeenCalled();
    });

    it('maps a passport with only a front side', () => {
        // Given a native result for a passport, which only has a front side
        const result = buildResult({
            document: {type: 'document', countryCode: 'GBR', sides: [{type: 'front', id: 'front-id', videoId: 'front-video-id'}]},
            faceVideo: FACE_VIDEO,
        });

        // When it is mapped
        const nativeResult = convertEntrustResultToOnfidoPayload(result);

        // Then the document has no back side, since a passport doesn't have one
        expect(nativeResult.document).toEqual({front: {id: 'front-id'}, back: undefined});
        expect(nativeResult.face).toEqual({id: 'face-video-id', variant: CONST.ONFIDO.NATIVE_FACE_VARIANT.VIDEO});
        expect(hmmmSpy).not.toHaveBeenCalled();
    });

    it('logs when the face is missing', () => {
        // Given a native result without a face video
        const result = buildResult({
            document: {type: 'document', countryCode: 'USA', sides: [{type: 'front', id: 'front-id', videoId: 'front-video-id'}]},
        });

        // When it is mapped
        const nativeResult = convertEntrustResultToOnfidoPayload(result);

        // Then no face is sent, and the gap is logged because the backend would fall back to the photo report and fail the check
        expect(nativeResult.face).toBeUndefined();
        expect(hmmmSpy).toHaveBeenCalledWith(expect.any(String), {stepTypes: ['document'], hasDocument: true, hasFace: false});
    });

    it('logs when the document sides are not the array native sends', () => {
        // Given a document whose sides use the `{front, back}` object from the SDK's TypeScript type instead of the native array
        const result = buildResult({
            document: {type: 'document', countryCode: 'USA', sides: {front: {id: 'front-id', videoId: 'front-video-id'}}},
            faceVideo: FACE_VIDEO,
        });

        // When it is mapped
        const nativeResult = convertEntrustResultToOnfidoPayload(result);

        // Then no document is sent and the gap is logged, so an unexpected shape shows up in the logs instead of failing silently
        expect(nativeResult.document).toBeUndefined();
        expect(hmmmSpy).toHaveBeenCalledWith(expect.any(String), {stepTypes: ['document', 'faceVideo'], hasDocument: false, hasFace: true});
    });
});
