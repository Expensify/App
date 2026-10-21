import isCameraClosedError from '@pages/iou/request/step/IOURequestStepScan/isCameraClosedError';

describe('isCameraClosedError', () => {
    it('recognizes the CameraX error for a capture cancelled by the camera closing', () => {
        // Given the error vision-camera passes through when CameraX closes the camera mid-capture
        const error = {code: 'unknown/unknown', message: 'Camera is closed.'};

        // When it is classified
        const result = isCameraClosedError(error);

        // Then it counts as the camera closing, so leaving the screen mid-capture is not logged as a failure
        expect(result).toBe(true);
    });

    it('recognizes the vision-camera error for a session that is already gone', () => {
        // Given the error vision-camera rejects with when the capture reaches native after the session closed
        const error = {code: 'session/camera-not-ready', message: 'The Camera is not ready yet! Wait for the onInitialized() callback!'};

        // When it is classified
        const result = isCameraClosedError(error);

        // Then it counts as the camera closing too
        expect(result).toBe(true);
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
