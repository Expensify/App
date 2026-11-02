import type {OnyxKey, OnyxValue} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/** Onyx has no promise-based read. */
function readOnceOnyxValue<TKey extends OnyxKey>(key: TKey): Promise<OnyxValue<TKey>> {
    return new Promise((resolve) => {
        const connection = Onyx.connectWithoutView({
            key,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });
}

export default readOnceOnyxValue;
