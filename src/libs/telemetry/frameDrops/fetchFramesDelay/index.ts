import type FetchFramesDelay from './types';

// Frame delay is only collected by Sentry's native SDKs, so there's nothing to query on web.
const fetchFramesDelay: FetchFramesDelay = () => Promise.resolve(undefined);

export default fetchFramesDelay;
