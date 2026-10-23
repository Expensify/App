import isCameraClosedError from '@pages/iou/request/step/IOURequestStepScan/isCameraClosedError';

describe('isCameraClosedError', () => {
    it('recognizes the CameraX error for a capture cancelled by the camera closing', () => {
        // Given the error vision-camera passes through when CameraX closes the camera mid-capture
        const error = new Error('androidx.camera.core.ImageCaptureException: Camera is closed.');

        // When it is classified
        const result = isCameraClosedError(error);

        // Then it counts as the camera closing, so leaving the screen mid-capture is not logged as a failure
        expect(result).toBe(true);
    });

    it('recognizes the vision-camera errors for a session that is already gone', () => {
        // Given the errors vision-camera v5 rejects with when the capture reaches native after the camera was torn down
        const errors = [
            new Error('PhotoOutput is not yet connected to the CameraSession!'),
            new Error('Photo Output is not yet attached to the CameraSession!'),
            new Error("Cannot take snapshot - PreviewView isn't ready yet!"),
        ];

        // When each is classified
        const results = errors.map(isCameraClosedError);

        // Then they count as the camera closing too, since v5 errors have no code to tell them apart
        expect(results).toEqual([true, true, true]);
    });

    it('does not treat other camera errors as the camera closing', () => {
        // Given real capture failures, and values that are not errors at all
        const errors: unknown[] = [{code: 'capture/file-io-error', message: 'Failed to write the photo to disk'}, new Error('Could not crop the photo'), 'Camera is closed', null, undefined];

        // When each is classified
        const results = errors.map(isCameraClosedError);

        // Then none count as the camera closing, so they keep their warning logs
        expect(results).toEqual([false, false, false, false, false]);
    });
});
