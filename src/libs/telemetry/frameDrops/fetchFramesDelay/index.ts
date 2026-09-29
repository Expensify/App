import type {FetchFramesDelay, IsFramesDelayAvailable} from './types';

// Frame delay is only collected by Sentry's native SDKs, so there's nothing to query on web.
const isFramesDelayAvailable: IsFramesDelayAvailable = () => false;

const fetchFramesDelay: FetchFramesDelay = () => Promise.resolve(undefined);

export default fetchFramesDelay;
export {isFramesDelayAvailable};
