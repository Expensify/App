import {useCallback, useEffect, useState} from 'react';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getOngoingRequest, subscribeToQueueState} from '@libs/Network/SequentialQueue';

// Commands that should trigger the LoadingBar to show
const RELEVANT_COMMANDS = new Set<string>([WRITE_COMMANDS.OPEN_APP, WRITE_COMMANDS.RECONNECT_APP, WRITE_COMMANDS.OPEN_REPORT]);

/**
 * Hook that determines whether LoadingBar should be visible based on active queue requests
 * Shows LoadingBar when OpenReport/OpenApp/ReconnectApp requests are being processed
 */
export default function useLoadingBarVisibility(): boolean {
    const [isRelevantQueueActive, setIsRelevantQueueActive] = useState(false);

    const checkRelevantQueue = useCallback(() => {
        const ongoingRequest = getOngoingRequest();
        const hasRelevantCommand = ongoingRequest && RELEVANT_COMMANDS.has(ongoingRequest.command);

        const shouldShowLoadingBar = !!hasRelevantCommand;

        setIsRelevantQueueActive(shouldShowLoadingBar);
    }, []);

    useEffect(() => {
        // Initial check
        checkRelevantQueue();

        // Subscribe to queue state changes for real-time updates
        return subscribeToQueueState(checkRelevantQueue);
    }, [checkRelevantQueue]);

    return isRelevantQueueActive;
}
