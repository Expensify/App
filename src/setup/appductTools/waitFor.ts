async function waitFor(check: () => boolean, timeoutMs: number): Promise<boolean> {
    const deadline = Date.now() + Math.max(0, timeoutMs);
    for (;;) {
        if (check()) {
            return true;
        }
        if (Date.now() >= deadline) {
            return false;
        }
        // eslint-disable-next-line no-await-in-loop
        await new Promise<void>((resolve) => {
            setTimeout(resolve, 100);
        });
    }
}

export default waitFor;
