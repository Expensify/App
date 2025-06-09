import {WRITE_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

// Commands that should trigger the LoadingBar to show
const RELEVANT_COMMANDS = new Set<string>([WRITE_COMMANDS.OPEN_APP, WRITE_COMMANDS.RECONNECT_APP, WRITE_COMMANDS.OPEN_REPORT]);

/**
 * Hook that determines whether LoadingBar should be visible based on active queue requests
 * Shows LoadingBar when OpenReport/OpenApp/ReconnectApp requests are being processed
 */
export default function useLoadingBarVisibility(): boolean {
    const [req] = useOnyx(ONYXKEYS.PERSISTED_REQUESTS, {canBeMissing: false});
    const [network] = useOnyx(ONYXKEYS.NETWORK, {canBeMissing: false});

    // Don't show loading bar if currently offline
    if (network?.isOffline) {
        return false;
    }

    return req?.some((request) => RELEVANT_COMMANDS.has(request.command) && !request.initiatedOffline) ?? false;
}
