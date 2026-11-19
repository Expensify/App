// VisionCamera v5 errors carry no code, so a capture cancelled by leaving the screen is recognised by its message:
// CameraX closing the camera mid-capture, a photo output that is no longer attached to the session (iOS, then Android),
// and an Android snapshot taken after the preview is gone.
const CAMERA_CLOSED_MESSAGES = [
    'Camera is closed',
    'PhotoOutput is not yet connected to the CameraSession!',
    'Photo Output is not yet attached to the CameraSession!',
    "PreviewView isn't ready yet",
];

function isCameraClosedError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null || !('message' in error) || typeof error.message !== 'string') {
        return false;
    }

    const {message} = error;
    return CAMERA_CLOSED_MESSAGES.some((closedMessage) => message.includes(closedMessage));
}

export default isCameraClosedError;
