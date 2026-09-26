/**
 * Creates a scheduler that coalesces calls until the queued microtask runs.
 */
function createScheduleOnce(run: () => void): () => void {
    let isScheduled = false;

    return () => {
        if (isScheduled) {
            return;
        }

        isScheduled = true;
        Promise.resolve().then(() => {
            isScheduled = false;
            run();
        });
    };
}

export default createScheduleOnce;
