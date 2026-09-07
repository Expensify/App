import type {FinishCloudflareSignInFromURL, GetCloudflareSignInOutcome} from './types';

/** Native: nothing to handle. Receiving the callback needs claimed Universal/App Links, not set up yet */
const finishCloudflareSignInFromURL: FinishCloudflareSignInFromURL = () => 'not-a-callback';

const getCloudflareSignInOutcome: GetCloudflareSignInOutcome = () => ({outcome: 'not-a-callback'});

export {finishCloudflareSignInFromURL, getCloudflareSignInOutcome};
