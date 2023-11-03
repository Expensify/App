/**
 * Like Promise.race, except it resolves with the first promise that resolves to the desired value.
 * If no promise resolves to the desired value, it rejects.
 */
export default function promiseRaceTo<T>(promises: Array<Promise<unknown>>, desiredValue: T): Promise<T> {
    return new Promise((resolve, reject) => {
        for (const p of promises) {
            Promise.resolve(p)
                .then((res) => {
                    if (res !== desiredValue) {
                        return;
                    }
                    resolve(res as T);
                })
                .catch(() => {});
        }
        Promise.allSettled(promises).then(() => reject());
    });
}
