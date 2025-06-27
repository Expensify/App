import {WRITE_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';
import useNetwork from './useNetwork';
import useCommandsLoading from './useCommandsLoading';
import useOnyx from './useOnyx';

// Commands that should trigger the LoadingBar to show
const RELEVANT_COMMANDS = new Set<string>([WRITE_COMMANDS.OPEN_APP, WRITE_COMMANDS.RECONNECT_APP, WRITE_COMMANDS.OPEN_REPORT, WRITE_COMMANDS.READ_NEWEST_ACTION]);

/**
 * Hook that determines whether LoadingBar should be visible based on active queue requests
 * Shows LoadingBar when any of the RELEVANT_COMMANDS are being processed
 *
 * @returns boolean indicating if the loading bar should be visible
 */
export default function useLoadingBarVisibility(): boolean {
    const hasRelevantCommands = useCommandsLoading(LOADING_BAR_COMMANDS);
    const {isOffline} = useNetwork();

    // Don't show loading bar if currently offline
    if (isOffline) {
        return false;
    }

    return hasRelevantCommands;
}
