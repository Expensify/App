import {useEffect, useState} from 'react';
import Onyx from 'react-native-onyx';

export default function useOnyx(key, defaultValue = null, config = {}) {
    const [value, setValue] = useState(defaultValue);
    const waitForCollectionCallback = config.waitForCollectionCallback || false;
    useEffect(() => {
        // eslint-disable-next-line rulesdir/prefer-onyx-connect-in-libs
        const connectionID = Onyx.connect({
            key,
            waitForCollectionCallback,
            callback: setValue,
        });
        return () => Onyx.disconnect(connectionID);
    }, []);
    return value;
}
