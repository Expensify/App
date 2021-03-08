function run() {
    const startTime = Date.now();
    console.debug('[Migrate Onyx] start');
    return new Promise((resolve) => {
        const timeElapsed = Date.now() - startTime;
        console.debug(`[Migrate Onyx] finished in ${timeElapsed}ms`);
        resolve();
    });
}
export default run;
