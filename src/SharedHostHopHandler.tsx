import {useEffect, useRef} from 'react';

import useOnyx from './hooks/useOnyx';
import {hopToSharedHost} from './libs/LegacyHostHop';
import ONYXKEYS from './ONYXKEYS';

type SharedHostHopHandlerProps = {
    /** Called when the page stays on this host, so startup can continue */
    onStay: () => void;
};

/**
 * Renders nothing. Moves the page to the shared host once the session has loaded.
 * Its own component, so its Onyx read exists only while a move is pending.
 */
function SharedHostHopHandler({onStay}: SharedHostHopHandlerProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const hasStarted = useRef(false);

    useEffect(() => {
        // The session has a default value, so it's undefined only until Onyx loads it
        if (hasStarted.current || session === undefined) {
            return;
        }
        hasStarted.current = true;
        hopToSharedHost(session)
            .then((isLeaving) => {
                if (isLeaving) {
                    return;
                }
                onStay();
            })
            .catch(onStay);
    }, [session, onStay]);

    return null;
}

export default SharedHostHopHandler;
