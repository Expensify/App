import type {ConsumeCloudflareAuthCallbackURL, GetCloudflareAuthRedirectOutcome} from './types';

/** Native: nothing to handle. Receiving the callback needs claimed Universal/App Links, not set up yet */
const consumeCloudflareAuthCallbackURL: ConsumeCloudflareAuthCallbackURL = () => 'not-a-callback';

const getCloudflareAuthRedirectOutcome: GetCloudflareAuthRedirectOutcome = () => ({outcome: 'not-a-callback'});

export {consumeCloudflareAuthCallbackURL, getCloudflareAuthRedirectOutcome};
