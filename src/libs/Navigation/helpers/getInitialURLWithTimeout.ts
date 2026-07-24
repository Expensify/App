import {Linking} from 'react-native';

/**
 * Races React Navigation's `Linking.getInitialURL()` against a timeout so navigation is never blocked
 * permanently when the URL never resolves (e.g. on HybridApp when OldDot fails to send the URL via the
 * native bridge). Resolves to `fallback` when the timeout wins. The pending timer is cleared as soon as
 * `getInitialURL()` settles so no dangling timeout is left behind.
 */
function getInitialURLWithTimeout<T extends null | undefined>(timeoutMs: number, fallback: T): Promise<string | null | T> {
    let timeoutId: ReturnType<typeof setTimeout>;
    return Promise.race([
        Linking.getInitialURL(),
        new Promise<T>((resolve) => {
            timeoutId = setTimeout(() => resolve(fallback), timeoutMs);
        }),
    ]).finally(() => {
        clearTimeout(timeoutId);
    });
}

export default getInitialURLWithTimeout;
