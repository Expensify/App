import type SearchRouterProfileSampleRate from './types';

// Android carries the metric's tail on a few hundred opens a week, so it gets the higher rate.
const searchRouterProfileSampleRate: SearchRouterProfileSampleRate = 0.2;

export default searchRouterProfileSampleRate;
