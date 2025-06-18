import {useCallback, useEffect, useRef} from 'react';
import {useOnyx} from 'react-native-onyx';
import Log from '@libs/Log';
import PusherUtils from '@libs/PusherUtils';
import ONYXKEYS from '@src/ONYXKEYS';

const TIMEOUT_MOUSE_ACTIVITY = 600_000;
const TIMEOUT_FOCUS_TAB = 60_000;

/**
 * Monitors user activity and controls their active/inactive status by joining/leaving the newDotWebPresence Pusher
 * channel.
 */
export default function PresenceController() {
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.accountID, canBeMissing: true});
    const timeout = useRef<NodeJS.Timeout | undefined>(undefined);
    const didJoinPresenceChannel = useRef(false);

    const goInactive = useCallback(() => {
        if (!accountID) {
            return;
        }

        Log.info('[PresenceController] Going inactive');
        didJoinPresenceChannel.current = false;
        PusherUtils.leaveWebPresenceChannel(accountID);
    }, [accountID]);

    const goActive = useCallback(
        (activity: string, timeoutMs: number) => {
            if (!accountID) {
                return;
            }

            // We reset the timeout here whenever new activity is detected to keep the user active for an appropriate
            // amount of time
            clearTimeout(timeout.current);
            timeout.current = setTimeout(() => {
                Log.info('[PresenceController] Activity timed out', false, {lastActivity: activity, lastTimeout: timeoutMs});
                goInactive();
            }, timeoutMs);

            if (didJoinPresenceChannel.current) {
                return;
            }

            Log.info('[PresenceController] Going active', false, {activity, timeoutMs});
            didJoinPresenceChannel.current = true;
            PusherUtils.joinWebPresenceChannel(accountID);
        },
        [accountID, goInactive],
    );

    const goActiveFromFocusing = useCallback(() => goActive('app focused', TIMEOUT_FOCUS_TAB), [goActive]);
    const goActiveFromBlurring = useCallback(() => goActive('app blurred', TIMEOUT_FOCUS_TAB), [goActive]);
    const goActiveFromMouseActivity = useCallback(() => goActive('mouse activity', TIMEOUT_MOUSE_ACTIVITY), [goActive]);

    // Go active on mount and go inactive on unmount
    useEffect(() => {
        goActiveFromFocusing();
        return () => goInactive();
    }, [goActiveFromFocusing, goInactive]);

    // Go active when the tab is focused
    useEffect(() => {
        window.addEventListener('focus', goActiveFromFocusing);
        return () => window.removeEventListener('focus', goActiveFromFocusing);
    }, [goActiveFromFocusing]);

    // Go active when the tab is blurred
    useEffect(() => {
        window.addEventListener('blur', goActiveFromBlurring);
        return () => window.removeEventListener('blur', goActiveFromBlurring);
    }, [goActiveFromBlurring]);

    // Go active when mouse activity is detected
    useEffect(() => {
        window.addEventListener('mousemove', goActiveFromMouseActivity);
        return () => window.removeEventListener('mousemove', goActiveFromMouseActivity);
    }, [goActiveFromMouseActivity]);

    return null;
}
