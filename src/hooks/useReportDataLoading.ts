import {WRITE_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

// Commands that should trigger loading states
const RELEVANT_COMMANDS = new Set<string>([WRITE_COMMANDS.OPEN_APP, WRITE_COMMANDS.RECONNECT_APP, WRITE_COMMANDS.OPEN_REPORT]);

/**
 * Hook that determines if report data is currently being loaded
 * 
 * Monitors persisted requests queue for OpenApp, ReconnectApp, and OpenReport commands
 * that trigger report data fetching from the server.
 * 
 * @param respectOfflineState - If true (default), won't show loading when offline (for loading bars).
 *                            If false, shows loading regardless of offline state (for full-screen loading).
 */
export default function useReportDataLoading(respectOfflineState = true): boolean {
    const [req] = useOnyx(ONYXKEYS.PERSISTED_REQUESTS, {canBeMissing: false});
    const [network] = useOnyx(ONYXKEYS.NETWORK, {canBeMissing: false});

    const hasRelevantRequests = req?.some((request) => 
        RELEVANT_COMMANDS.has(request.command) && !request.initiatedOffline
    ) ?? false;

    // For loading bars, respect offline state (don't show when offline)
    // For full-screen loading, ignore offline state
    if (respectOfflineState && network?.isOffline) {
        return false;
    }

    return hasRelevantRequests;
}