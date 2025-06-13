import {useCallback, useEffect, useRef} from 'react';
import {useOnyx} from 'react-native-onyx';
import useAppFocusEvent from '@hooks/useAppFocusEvent';
import Log from '@libs/Log';
import PusherUtils from '@libs/PusherUtils';
import ONYXKEYS from '@src/ONYXKEYS';

const TIMEOUT_MOUSE_ACTIVITY = 1000 * 60 * 10;
const TIMEOUT_FOCUS_TAB = 1000 * 60 * 1;

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

    const goActive = useCallback(
        (timeoutMs: number) => {
            if (!accountID) {
                return;
            }

            if (timeout.current) {
                clearTimeout(timeout.current);
            }
            timeout.current = setTimeout(() => {
                Log.info('[PresenceController] activity timed out');
                goInactive();
            }, timeoutMs);

            if (didJoinPresenceChannel.current) {
                return;
            }

            Log.info('[PresenceController] Going active', false, {timeoutMs});
            didJoinPresenceChannel.current = true;
            PusherUtils.joinPresenceChannel(accountID);
        },
        [accountID, goInactive],
    );

    const goActiveFromFocusing = useCallback(() => goActive(TIMEOUT_FOCUS_TAB), [goActive]);

    // Go active on mount and go inactive on unmount
    useEffect(() => {
        goActiveFromFocusing();
        return () => goInactive();
    }, [goActiveFromFocusing, goInactive]);

    // Go active when the tab is focused
    useAppFocusEvent(goActiveFromFocusing);

    // Go active when mouse activity is detected
    useEffect(() => {
        const goActiveForMouseActivity = () => goActive(TIMEOUT_MOUSE_ACTIVITY);
        document.addEventListener('mousemove', goActiveForMouseActivity);
        return () => document.removeEventListener('mousemove', goActiveForMouseActivity);
    }, [goActive]);

    return null;
}
