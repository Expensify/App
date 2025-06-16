import {useMemo} from 'react';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

/**
 * Hook that determines if any of the specified commands are currently being processed
 *
 * Monitors persisted requests queue for the provided commands that are not initiated offline.
 *
 * @param commands - Array of command strings to monitor
 * @returns boolean indicating if any of the specified commands are currently loading
 */
export default function useCommandsLoading(commands: string[]): boolean {
    const [req] = useOnyx(ONYXKEYS.PERSISTED_REQUESTS, {canBeMissing: false});

    return useMemo(() => req?.some((request) => commands.includes(request.command) && !request.initiatedOffline) ?? false, [req, commands]);
}
