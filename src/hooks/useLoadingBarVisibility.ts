import {useCallback, useEffect, useState} from 'react';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getCurrentRequestCommand, isRunning, subscribeToQueueState} from '@libs/Network/SequentialQueue';

// Commands that should trigger the LoadingBar to show
const RELEVANT_COMMANDS = [
    WRITE_COMMANDS.OPEN_APP, 
    WRITE_COMMANDS.RECONNECT_APP, 
    WRITE_COMMANDS.OPEN_REPORT
] as const;

/**
 * Hook that determines whether LoadingBar should be visible based on active queue requests
 * Shows LoadingBar when OpenReport/OpenApp/ReconnectApp requests are being processed
 */
export default function useLoadingBarVisibility(): boolean {
    const [isRelevantQueueActive, setIsRelevantQueueActive] = useState(false);

    const checkRelevantQueue = useCallback(() => {
        // Check if queue is running
        const isQueueRunning = isRunning();

        if (!isQueueRunning) {
            setIsRelevantQueueActive(false);
            return;
        }

        // Get current request and check if it's a relevant command
        const currentCommand = getCurrentRequestCommand();
        const hasRelevantCommand = currentCommand && 
            (RELEVANT_COMMANDS as readonly string[]).includes(currentCommand);

        setIsRelevantQueueActive(!!hasRelevantCommand);
    }, []);

    useEffect(() => {
        // Initial check
        checkRelevantQueue();

        // Subscribe to queue state changes for real-time updates
        return subscribeToQueueState(checkRelevantQueue);
    }, [checkRelevantQueue]);

    return isRelevantQueueActive;
}
