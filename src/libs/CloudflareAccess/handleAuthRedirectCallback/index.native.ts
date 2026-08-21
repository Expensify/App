import type {GetCloudflareAuthRedirectOutcome, HandleCloudflareAuthRedirectCallback} from './types';

/** Native: nothing to handle. Receiving the callback needs claimed Universal/App Links, not set up yet */
const handleCloudflareAuthRedirectCallback: HandleCloudflareAuthRedirectCallback = () => 'not-a-callback';

const getCloudflareAuthRedirectOutcome: GetCloudflareAuthRedirectOutcome = () => ({outcome: 'not-a-callback'});

export {getCloudflareAuthRedirectOutcome, handleCloudflareAuthRedirectCallback};
