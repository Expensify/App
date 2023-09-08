// Set up manual mocks for any Logging methods that are supposed hit the 'server',
// this is needed because before, the Logging queue would get flushed while tests were running,
// causing unexpected calls to HttpUtils.xhr() which would cause mock mismatches and flaky tests.
export default {
    info: (message: string) => console.debug(`[info] ${message} (mocked)`),
    alert: (message: string) => console.debug(`[alert] ${message} (mocked)`),
    warn: (message: string) => console.debug(`[warn] ${message} (mocked)`),
    hmmm: (message: string) => console.debug(`[hmmm] ${message} (mocked)`),
};
