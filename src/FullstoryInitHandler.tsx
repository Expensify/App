import * as Sentry from '@sentry/react-native';
import {useEffect} from 'react';
import CONST from './CONST';
import useOnyx from './hooks/useOnyx';
import FS from './libs/Fullstory';
import ONYXKEYS from './ONYXKEYS';

/**
 * Component that does not render anything but isolates the USER_METADATA Onyx subscription
 * from the root Expensify component. Initializes Fullstory and sets the
 * Sentry Fullstory context whenever user metadata changes.
 */
function FullstoryInitHandler() {
    const [userMetadata] = useOnyx(ONYXKEYS.USER_METADATA);

    useEffect(() => {
        FS.init(userMetadata);
        FS.getSessionURL().then((url) => {
            if (!url) {
                return;
            }
            Sentry.setContext(CONST.TELEMETRY.CONTEXT_FULLSTORY, {url});
        });
    }, [userMetadata]);

    return null;
}

export default FullstoryInitHandler;
