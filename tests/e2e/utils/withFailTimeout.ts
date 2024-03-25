import CONFIG from '../config';

const TIMEOUT = Number(process.env.INTERACTION_TIMEOUT ?? CONFIG.INTERACTION_TIMEOUT);

const withFailTimeout = (promise: Promise<void>, name: string): Promise<void> =>
    new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error(`"${name}": Interaction timed out after ${(TIMEOUT / 1000).toFixed(0)}s`));
        }, TIMEOUT);

        promise
            .then((value) => {
                resolve(value);
            })
            .catch((e) => {
                reject(e);
            })
            .finally(() => {
                clearTimeout(timeoutId);
            });
    });

export default withFailTimeout;
