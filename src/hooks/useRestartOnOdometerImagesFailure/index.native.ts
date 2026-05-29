// On native blob:// URLs don't exist, so there is nothing to check —
// callers can always proceed with blob-dependent side-effects (like stitching)

const useRestartOnOdometerImagesFailure = (): {hasVerifiedBlobs: boolean} => ({hasVerifiedBlobs: true});

export default useRestartOnOdometerImagesFailure;
