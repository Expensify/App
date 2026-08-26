// On native blob:// URLs don't exist, so there is nothing to check —
// callers can always proceed with blob-dependent side-effects (like stitching)

const useRestartOnOdometerImagesFailure = (
    _transaction?: unknown,
    _reportID?: unknown,
    _iouType?: unknown,
    _backToReport?: unknown,
    _onBackupHandled?: (args: {shouldResetLocalState: boolean}) => void,
): {hasVerifiedBlobs: boolean} => ({hasVerifiedBlobs: true});

export default useRestartOnOdometerImagesFailure;
