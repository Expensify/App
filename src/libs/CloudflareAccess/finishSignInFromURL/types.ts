import type {CloudflareSignInOutcome} from '@libs/CloudflareAccess/captureAuthCallbackURL/types';

/** A no-op on every load that is not the callback */
type FinishCloudflareSignInFromURL = () => CloudflareSignInOutcome;

export default FinishCloudflareSignInFromURL;
