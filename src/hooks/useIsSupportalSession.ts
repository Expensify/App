import ONYXKEYS from '@src/ONYXKEYS';

import {isSupportalSessionSelector} from '@selectors/Session';

import useOnyx from './useOnyx';

/**
 * Returns true when the current session is a supportal (support agent) session.
 * The subscription is narrowed to the derived boolean so consumers only re-render when the session type actually changes.
 * Fails open: while SESSION is still loading this returns false, so a normal user is never briefly blocked from an action.
 * The SupportalPermission response middleware remains the backstop for anything that slips through.
 */
function useIsSupportalSession(): boolean {
    const [isSupportalSession = false] = useOnyx(ONYXKEYS.SESSION, {selector: isSupportalSessionSelector});

    return isSupportalSession;
}

export default useIsSupportalSession;
