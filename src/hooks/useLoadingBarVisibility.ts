import {useCallback, useEffect, useState} from 'react';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as SequentialQueue from '@libs/Network/SequentialQueue';

const RELEVANT_COMMANDS = [WRITE_COMMANDS.OPEN_APP, WRITE_COMMANDS.RECONNECT_APP, WRITE_COMMANDS.OPEN_REPORT] as const;

/**
 * Hook that determines whether LoadingBar should be visible based on active queue requests
 * Replaces the Onyx-based IS_LOADING_REPORT_DATA approach
 */
export default function useLoadingBarVisibility(): boolean {
    const [shouldShow, setShouldShow] = useState(false);

    const checkQueueStatus = useCallback(() => {
        // Check if queue is running
        const isQueueRunning = SequentialQueue.isRunning();

        if (!isQueueRunning) {
            setShouldShow(false);
            return;
        }

        // Get current request and check if it's a relevant command
        const currentRequestCommand: string | null = SequentialQueue.getCurrentRequestCommand();
        const hasRelevantRequest = currentRequestCommand !== null && (RELEVANT_COMMANDS as readonly string[]).includes(currentRequestCommand);

        setShouldShow(hasRelevantRequest);
    }, []);

    useEffect(() => {
        // Initial check
        checkQueueStatus();

        // Poll queue status - using a reasonable interval to avoid performance issues
        // In the future, this could be replaced with an event-driven approach
        const interval = setInterval(checkQueueStatus, 50);

        return () => clearInterval(interval);
    }, [checkQueueStatus]);

    return shouldShow;
}
