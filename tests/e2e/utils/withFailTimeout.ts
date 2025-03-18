import CONFIG from '../config';

// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- nullish coalescing doesn't achieve the same result in this case
const TIMEOUT = Number(process.env.INTERACTION_TIMEOUT || CONFIG.INTERACTION_TIMEOUT);

type WithFailTimeoutReturn = {
    promise: Promise<unknown>;
    resetTimeout: () => void;
};

const withFailTimeout = (promise: Promise<void>, name: string): WithFailTimeoutReturn => {
    let timeoutId: NodeJS.Timeout;
    const resetTimeout = () => {
        clearTimeout(timeoutId);
    };
    const race = new Promise((resolve, reject) => {
        timeoutId = setTimeout(() => {
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
                resetTimeout();
            });
    });

    return {promise: race, resetTimeout};
};

export default withFailTimeout;
