import {useCallback, useEffect, useRef} from 'react';
import {useOnyx} from 'react-native-onyx';
import Log from '@libs/Log';
import PusherUtils from '@libs/PusherUtils';
import ONYXKEYS from '@src/ONYXKEYS';

export default function PresenceController() {
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.accountID, canBeMissing: true});
    const timeout = useRef<NodeJS.Timeout | null>(null);
    const didJoinPresenceChannel = useRef(false);

    const goInactive = useCallback(() => {
        if (!accountID) {
            return;
        }

        Log.info('[PresenceController] Going inactive');
        didJoinPresenceChannel.current = false;
        PusherUtils.leavePresenceChannel(accountID);
    }, [accountID]);

    const goActive = useCallback(() => {
        if (!accountID) {
            return;
        }

        if (timeout.current) {
            clearTimeout(timeout.current);
        }
        timeout.current = setTimeout(() => {
            Log.info('[PresenceController] activity timed out');
            goInactive();
        }, 10_000);

        if (didJoinPresenceChannel.current) {
            return;
        }

        Log.info('[PresenceController] Going active');
        didJoinPresenceChannel.current = true;
        PusherUtils.joinPresenceChannel(accountID);
    }, [accountID, goInactive]);

    useEffect(() => {
        goActive();
        return () => goInactive();
    }, [goActive, goInactive]);

    useEffect(() => {
        const goActiveForMouseActivity = () => goActive();
        document.addEventListener('mousemove', goActiveForMouseActivity);
        return () => document.removeEventListener('mousemove', goActiveForMouseActivity);
    }, [goActive]);

    return null;
}
