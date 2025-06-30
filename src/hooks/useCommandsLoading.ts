import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

/**
 * Hook that determines if any of the specified commands are currently being processed
 *
 * @param commands - Set of command strings to monitor
 * @returns boolean indicating if any of the specified commands are currently loading
 */
export default function useCommandsLoading(commands: Set<string>): boolean {
    const [persistedRequests] = useOnyx(ONYXKEYS.PERSISTED_REQUESTS, {canBeMissing: false});
    const [ongoingRequests] = useOnyx(ONYXKEYS.PERSISTED_ONGOING_REQUESTS, {canBeMissing: false});

    const hasPersistedRequests = persistedRequests?.some((request) => commands.has(request.command) && !request.initiatedOffline) ?? false;
    const hasOngoingRequests = !!ongoingRequests && commands.has(ongoingRequests?.command);

    return hasPersistedRequests || hasOngoingRequests;
}
