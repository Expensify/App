import type {Connection, OnyxKey, OnyxValue} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * Reads the current value of an Onyx key once through a temporary connection. The connection is
 * disconnected after the first value or when the optional abort signal fires. An aborted read
 * rejects with the signal's reason, matching the platform convention for AbortSignal-based APIs.
 */
function readOnyxValueOnce<TKey extends OnyxKey>(key: TKey, signal?: AbortSignal): Promise<OnyxValue<TKey>> {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(signal.reason);
            return;
        }

        let connection: Connection;
        const onAbort = () => {
            Onyx.disconnect(connection);
            reject(signal?.reason);
        };

        signal?.addEventListener('abort', onAbort, {once: true});
        connection = Onyx.connectWithoutView({
            key,
            callback: (value) => {
                signal?.removeEventListener('abort', onAbort);
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });
}

export default readOnyxValueOnce;
