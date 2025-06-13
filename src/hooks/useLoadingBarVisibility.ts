import {WRITE_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';
import useCommandsLoading from './useCommandsLoading';
import useOnyx from './useOnyx';

// Commands that should trigger loading bar visibility
const LOADING_BAR_COMMANDS = [WRITE_COMMANDS.OPEN_APP, WRITE_COMMANDS.RECONNECT_APP, WRITE_COMMANDS.OPEN_REPORT];

/**
 * Hook that determines when the loading bar should be visible
 *
 * Monitors persisted requests queue for OpenApp, ReconnectApp, and OpenReport commands
 * that trigger report data fetching from the server. The loading bar is hidden when offline
 * to provide better UX since users can't interact with loading content while offline.
 *
 * @returns boolean indicating if the loading bar should be visible
 */
export default function useLoadingBarVisibility(): boolean {
    const [network] = useOnyx(ONYXKEYS.NETWORK, {canBeMissing: false});
    const hasRelevantCommands = useCommandsLoading(LOADING_BAR_COMMANDS);

    // Loading bar should not be shown when offline since users can't interact with loading content
    if (network?.isOffline) {
        return false;
    }

    return hasRelevantCommands;
}
