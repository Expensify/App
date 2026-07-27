import type {Connection, OnyxKey, OnyxValue} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * Reads the current value of an Onyx key once through a temporary connection. The connection is
 * disconnected after the first value or when the optional abort signal fires; an aborted read never
 * resolves, which lets XState actors drop it silently when they are stopped.
 */
function readOnyxValueOnce<TKey extends OnyxKey>(key: TKey, signal?: AbortSignal): Promise<OnyxValue<TKey>> {
    return new Promise((resolve) => {
        let connection: Connection;
        const disconnect = () => Onyx.disconnect(connection);

        signal?.addEventListener('abort', disconnect, {once: true});
        connection = Onyx.connectWithoutView({
            key,
            callback: (value) => {
                signal?.removeEventListener('abort', disconnect);
                disconnect();
                resolve(value);
            },
        });
    });
}

export default readOnyxValueOnce;
