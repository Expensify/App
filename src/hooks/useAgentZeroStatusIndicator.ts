import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';

type AgentZeroStatusState = {
    displayLabel?: string;
    kickoffWaitingIndicator: () => void;
};

const WAITING_LABEL = 'Concierge is waiting...';
const INITIAL_FILLER_DELAY_MS = 1200;
const MAX_FILLER_DELAY_MS = 12000;
const BACKOFF_MULTIPLIER = 1.8;
const JITTER_RATIO = 0.25; // +/-25% jitter keeps timers from feeling scripted

const GENERIC_FILLER_MESSAGES = [
    'Concierge is gathering context...',
    'Concierge is analyzing semantic content...',
    'Concierge is considering responses...',
    'Concierge is verifying details...',
    'Concierge is deciding whether to escalate...',
    'Concierge is organizing your information...',
    'Concierge is identifying key insights...',
    'Concierge is synthesizing relevant data...',
    'Concierge is checking for potential issues...',
    'Concierge is refining its understanding...',
    'Concierge is preparing a response strategy...',
    'Concierge is reviewing edge cases...',
    'Concierge is aligning on the best answer...',
    'Concierge is ensuring clarity and accuracy...',
    'Concierge is finalizing its recommendations...',
];

const TOOL_AWARE_FILLER_MESSAGES = [
    'Concierge is gathering context...',
    'Concierge is analyzing semantic content...',
    'Concierge is considering responses...',
    'Concierge is verifying details...',
];

function getFillerMessages(baseLabel: string): string[] {
    const normalized = baseLabel.toLowerCase();

    if (normalized.includes('search') || normalized.includes('lookup') || normalized.includes('looking up')) {
        return TOOL_AWARE_FILLER_MESSAGES;
    }

    return GENERIC_FILLER_MESSAGES;
}

/**
 * Blends the server-driven AgentZero indicator with local UX polish:
 * - Optimistically shows a "waiting" state as soon as the user sends to Concierge
 * - If a server label stalls, rotates filler messages with exponential backoff + jitter
 * - Resets instantly when a new server label arrives
 */
function useAgentZeroStatusIndicator(reportID: string, isConciergeChat: boolean): AgentZeroStatusState {
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {canBeMissing: true});
    const serverLabel = reportNameValuePairs?.agentZeroProcessingRequestIndicator?.trim();
    const [optimisticLabel, setOptimisticLabel] = useState<string>();
    const [displayLabel, setDisplayLabel] = useState<string>();

    const baseLabel = useMemo(() => serverLabel || optimisticLabel || '', [optimisticLabel, serverLabel]);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const fillerIndexRef = useRef<number>(0);
    const nextDelayRef = useRef<number>(INITIAL_FILLER_DELAY_MS);
    const baseLabelRef = useRef<string>(baseLabel);

    const clearTimer = useCallback(() => {
        if (!timerRef.current) {
            return;
        }
        clearTimeout(timerRef.current);
        timerRef.current = null;
    }, []);

    const kickoffWaitingIndicator = useCallback(() => {
        if (!isConciergeChat || serverLabel) {
            return;
        }

        setOptimisticLabel(WAITING_LABEL);
    }, [isConciergeChat, serverLabel]);

    useEffect(() => {
        // Server has taken over, drop optimistic labels.
        if (serverLabel) {
            setOptimisticLabel(undefined);
        }
    }, [serverLabel]);

    useEffect(() => {
        baseLabelRef.current = baseLabel;
        clearTimer();

        if (!isConciergeChat || !baseLabel) {
            setDisplayLabel(undefined);
            return;
        }

        const fillerMessages = getFillerMessages(baseLabel);
        fillerIndexRef.current = Math.floor(Math.random() * fillerMessages.length);
        nextDelayRef.current = INITIAL_FILLER_DELAY_MS;
        setDisplayLabel(baseLabel);

        const scheduleNextFiller = () => {
            const jitter = nextDelayRef.current * JITTER_RATIO;
            const randomJitter = (Math.random() * 2 - 1) * jitter;
            const delay = Math.min(MAX_FILLER_DELAY_MS, Math.max(INITIAL_FILLER_DELAY_MS, nextDelayRef.current + randomJitter));

            clearTimer();
            timerRef.current = setTimeout(() => {
                // A new server label arrived; abandon this filler loop.
                if (baseLabelRef.current !== baseLabel) {
                    return;
                }

                const messages = getFillerMessages(baseLabelRef.current);
                const nextIndex = fillerIndexRef.current % messages.length;
                setDisplayLabel(messages[nextIndex]);
                fillerIndexRef.current = (fillerIndexRef.current + 1) % messages.length;
                nextDelayRef.current = Math.min(MAX_FILLER_DELAY_MS, Math.round(nextDelayRef.current * BACKOFF_MULTIPLIER));
                scheduleNextFiller();
            }, delay);
        };

        scheduleNextFiller();

        return clearTimer;
    }, [baseLabel, clearTimer, isConciergeChat]);

    useEffect(() => clearTimer, [clearTimer]);

    return useMemo(
        () => ({
            displayLabel,
            kickoffWaitingIndicator,
        }),
        [displayLabel, kickoffWaitingIndicator],
    );
}

export default useAgentZeroStatusIndicator;
