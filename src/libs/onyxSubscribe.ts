import Onyx, {ConnectOptions} from 'react-native-onyx';
import {OnyxKey} from '../ONYXKEYS';

/**
 * Connect to onyx data. Same params as Onyx.connect(), but returns a function to unsubscribe.
 *
 * @param mapping Same as for Onyx.connect()
 * @return Unsubscribe callback
 */
function onyxSubscribe<TKey extends OnyxKey>(mapping: ConnectOptions<TKey>) {
    const connectionId = Onyx.connect(mapping);
    return () => Onyx.disconnect(connectionId);
}

export default onyxSubscribe;
