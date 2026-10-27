/**
 * Share of Search Router opens that get a Hermes profile, from 0 to 1. Profiled opens pay the profiler's cost inside the
 * measured span, so the rates stay a small fraction of opens.
 */
type SearchRouterProfileSampleRate = number;

export default SearchRouterProfileSampleRate;
