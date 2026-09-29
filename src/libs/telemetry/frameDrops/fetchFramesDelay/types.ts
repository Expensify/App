/** Resolves the total frame delay in seconds between two Unix timestamps (in seconds), or undefined when it can't be measured. */
type FetchFramesDelay = (startTimestampSeconds: number, endTimestampSeconds: number) => Promise<number | undefined>;

export default FetchFramesDelay;
