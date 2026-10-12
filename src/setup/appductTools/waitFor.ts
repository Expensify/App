/** Poll `check` every 100ms until it is truthy or `timeoutMs` elapses. True when it became truthy. */
async function waitFor(check: () => boolean, timeoutMs: number): Promise<boolean> {
    const deadline = Date.now() + Math.max(0, timeoutMs);
    for (;;) {
        if (check()) {
            return true;
        }
        if (Date.now() >= deadline) {
            return false;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
}

export {waitFor};
