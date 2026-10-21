// CameraX rejects an in-flight capture with this message when the camera closes, and vision-camera passes it through as `unknown/unknown`.
const CAMERA_CLOSED_MESSAGE = 'Camera is closed';

// vision-camera rejects with this code when the session is already gone by the time the capture reaches native.
const CAMERA_SESSION_GONE_CODE = 'session/camera-not-ready';

function isCameraClosedError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
        return false;
    }

    if ('code' in error && error.code === CAMERA_SESSION_GONE_CODE) {
        return true;
    }

    return 'message' in error && typeof error.message === 'string' && error.message.includes(CAMERA_CLOSED_MESSAGE);
}

export default isCameraClosedError;
