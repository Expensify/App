import type {Connection, OnyxKey, OnyxValue} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * Resolves with the first value of an Onyx key that satisfies the predicate. The temporary
 * connection stays active while values do not match and is disconnected when the optional abort
 * signal fires. An aborted wait never resolves, which lets XState actors drop it silently when
 * they are stopped.
 */
function waitForOnyxValue<TKey extends OnyxKey>(key: TKey, predicate: (value: OnyxValue<TKey>) => boolean, signal?: AbortSignal): Promise<OnyxValue<TKey>> {
    return new Promise((resolve) => {
        if (signal?.aborted) {
            return;
        }

        let connection: Connection;
        const disconnect = () => Onyx.disconnect(connection);

        signal?.addEventListener('abort', disconnect, {once: true});
        connection = Onyx.connectWithoutView({
            key,
            callback: (value) => {
                if (!predicate(value)) {
                    return;
                }
                signal?.removeEventListener('abort', disconnect);
                disconnect();
                resolve(value);
            },
        });
    });
}

/**
 * Reads the current value of an Onyx key once through a temporary connection. The connection is
 * disconnected after the first value or when the optional abort signal fires. An aborted read never
 * resolves, which lets XState actors drop it silently when they are stopped.
 */
function readOnyxValueOnce<TKey extends OnyxKey>(key: TKey, signal?: AbortSignal): Promise<OnyxValue<TKey>> {
    return waitForOnyxValue(key, () => true, signal);
}

export {readOnyxValueOnce};
export default waitForOnyxValue;
