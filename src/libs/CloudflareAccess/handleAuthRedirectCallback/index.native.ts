import type {CloudflareAuthRedirectOutcome, CloudflareAuthRedirectResult} from './types';

/** Native: nothing to handle — receiving the callback needs claimed Universal/App Links, not set up yet */
function handleCloudflareAuthRedirectCallback(): CloudflareAuthRedirectOutcome {
    return 'not-a-callback';
}

function getCloudflareAuthRedirectOutcome(): CloudflareAuthRedirectResult {
    return {outcome: 'not-a-callback'};
}

export {getCloudflareAuthRedirectOutcome, handleCloudflareAuthRedirectCallback};
