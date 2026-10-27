/**
 * Share of Search Router opens that get a Hermes profile, from 0 to 1. Kept low on every platform because profiled
 * opens pay the profiler's cost inside the measured span.
 */
type SearchRouterProfileSampleRate = number;

export default SearchRouterProfileSampleRate;
