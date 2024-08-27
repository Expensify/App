import type {ConnectOptions} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {OnyxCollectionKey, OnyxKey} from '@src/ONYXKEYS';

/**
 * Connect to onyx data. Same params as Onyx.connect(), but returns a function to unsubscribe.
 *
 * @param mapping Same as for Onyx.connect()
 * @return Unsubscribe callback
 */
function onyxSubscribe<TKey extends OnyxKey | `${OnyxCollectionKey}${string}`>(mapping: ConnectOptions<TKey>) {
    const connection = Onyx.connect(mapping);
    return () => Onyx.disconnect(connection);
}

export default onyxSubscribe;
