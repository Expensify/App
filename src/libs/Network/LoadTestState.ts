type LoadTestParameters = {
    multiplier?: number;
    expire?: string;
};

/**
 * Hard upper bound on how many copies of a single API request we will fan out per real request.
 * Defends against a malicious or misconfigured server returning an oversized (or `Infinity`)
 * `multiplier` and turning the client into a self-DDOS / freezing the JS thread in `triggerDuplicates`.
 * 100 is well above any plausible legitimate load-test value (typically 3-10) but small enough that
 * even a worst case won't lock up the browser.
 */
const MAX_MULTIPLIER = 100;

let loadTest: LoadTestParameters = {};

/**
 * Parses the X-Load-Test response header JSON and stores multiplier / expire for duplicate request generation.
 * Kept separate from LoadTest.ts so HttpUtils can import this without a circular dependency on HttpUtils.
 */
function setLoadTestParameters(headerString: string | null): void {
    if (!headerString) {
        loadTest = {};
        return;
    }
    try {
        loadTest = JSON.parse(headerString) as LoadTestParameters;
    } catch {
        loadTest = {};
    }
}

/**
 * Returns how many duplicate mock requests to send after each real request (multiplier - 1), or 0 when inactive or expired.
 * The multiplier is sanitized: anything that is not a finite integer >= 2 returns 0, and the result is capped at
 * `MAX_MULTIPLIER - 1` to prevent a malicious/misconfigured `X-Load-Test` header from triggering an effectively
 * unbounded fan-out (e.g. `multiplier: 1e309` parses to `Infinity`).
 */
function getDuplicateRequestCount(): number {
    const rawMultiplier = loadTest.multiplier;
    if (typeof rawMultiplier !== 'number' || !Number.isFinite(rawMultiplier)) {
        return 0;
    }
    const multiplier = Math.min(Math.floor(rawMultiplier), MAX_MULTIPLIER);
    if (multiplier < 2) {
        return 0;
    }

    const expire = loadTest.expire;
    const expireTime = expire ? new Date(expire).getTime() : Number.NaN;
    if (!Number.isFinite(expireTime) || Date.now() >= expireTime) {
        return 0;
    }

    return multiplier - 1;
}

export {getDuplicateRequestCount, setLoadTestParameters, MAX_MULTIPLIER};
