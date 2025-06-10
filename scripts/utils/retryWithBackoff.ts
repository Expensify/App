type RetryOptions = {
    maxRetries?: number;
    initialDelayMs?: number;
    factor?: number;
    isRetryable?: (err: unknown) => boolean;
};

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function retryWithBackoff<T>(fn: () => Promise<T>, {maxRetries = 5, initialDelayMs = 1000, factor = 2, isRetryable = () => true}: RetryOptions = {}): Promise<T> {
    let attempt = 0;
    let delay = initialDelayMs;

    let lastError: unknown;
    do {
        try {
            return await fn();
        } catch (err) {
            lastError = err;
            attempt++;
            if (!isRetryable(err)) {
                break;
            }
            await sleep(delay);
            delay *= factor;
        }
    } while (attempt <= maxRetries);

    throw lastError;
}

export default retryWithBackoff;
