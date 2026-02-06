import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

type AgentZeroStatusState = {
    displayLabel?: string;
    kickoffWaitingIndicator: () => void;
};

const WAITING_LABEL = 'Concierge is waiting for you to finish...';
const INITIAL_FILLER_DELAY_MS = 4000;
const MAX_FILLER_DELAY_MS = 8000;
const BACKOFF_MULTIPLIER = 1.8;
const JITTER_RATIO = 0.25; // +/-25% jitter to keep timers from feeling scripted

const GENERIC_FILLER_MESSAGES = [
    'Concierge is gathering context...',
    'Concierge is analyzing semantic content...',
    'Concierge is considering responses...',
    'Concierge is verifying details...',
    'Concierge is organizing your information...',
    'Concierge is identifying key insights...',
    'Concierge is synthesizing relevant data...',
    'Concierge is checking for potential issues...',
    'Concierge is refining its understanding...',
    'Concierge is preparing a response strategy...',
    'Concierge is reviewing edge cases...',
    'Concierge is aligning on the best answer...',
    'Concierge is ensuring clarity and accuracy...',
];

// Grouped filler pools keyed by a semantic category. These map to server-provided labels
const FILLER_MESSAGE_POOLS: Record<string, string[]> = {
    data: [
        'Concierge is retrieving data...',
        'Concierge is validating information...',
        'Concierge is compiling results...',
        'Concierge is checking consistency...',
        'Concierge is fetching records...',
        'Concierge is querying services...',
        'Concierge is correlating sources...',
        'Concierge is validating sources...',
    ],
    expenseAction: ['Concierge is verifying details...', 'Concierge is saving changes...', 'Concierge is confirming completion...', 'Concierge is ensuring compliance...'],
    expenseUpdate: [
        'Concierge is updating the expense...',
        'Concierge is checking policy rules...',
        'Concierge is applying the change...',
        'Concierge is confirming the update...',
        'Concierge is validating changes...',
        'Concierge is syncing policy updates...',
        'Concierge is normalizing data...',
        'Concierge is saving your edits...',
        'Concierge is finalizing updates...',
    ],
    preferenceUpdate: [
        'Concierge is updating your preferences...',
        'Concierge is confirming changes...',
        'Concierge is saving settings...',
        'Concierge is validating selections...',
        'Concierge is loading settings...',
        'Concierge is applying preferences...',
        'Concierge is syncing your account...',
        'Concierge is updating notifications...',
        'Concierge is saving your profile...',
        'Concierge is checking workspace settings...',
        'Concierge is validating permissions...',
        'Concierge is aligning defaults...',
        'Concierge is updating your workspace...',
    ],
    comment: [
        'Concierge is composing...',
        'Concierge is posting...',
        'Concierge is finalizing...',
        'Concierge is formatting your message...',
        'Concierge is polishing phrasing...',
        'Concierge is inserting details...',
        'Concierge is double-checking tone...',
        'Concierge is drafting a reply...',
        'Concierge is clarifying context...',
        'Concierge is proofreading...',
        'Concierge is preparing to send...',
    ],
    escalation: [
        'Concierge is checking who can help...',
        'Concierge is handing off to a teammate...',
        'Concierge is confirming the escalation...',
        'Concierge is paging a specialist...',
        'Concierge is summarizing your case...',
        'Concierge is routing to the best team...',
        'Concierge is attaching relevant details...',
        'Concierge is coordinating the handoff...',
        'Concierge is confirming availability...',
        'Concierge is prioritizing your request...',
        'Concierge is notifying support...',
        'Concierge is tracking the escalation...',
        'Concierge is verifying next steps...',
    ],

    generic: GENERIC_FILLER_MESSAGES,
};

// Grouped backend labels by the pool we want to use
const STATUS_LABEL_GROUPS: Record<string, string[]> = {
    data: ['Concierge is looking up categories...', 'Concierge is looking up tags...', 'Concierge is looking up tax codes...', 'Concierge is searching documentation...'],
    expenseAction: ['Concierge is creating an expense...', 'Concierge is creating a distance expense...', 'Concierge is deleting an expense...'],
    expenseUpdate: [
        'Concierge is updating category...',
        'Concierge is updating description...',
        'Concierge is updating merchant...',
        'Concierge is updating amount and currency...',
        'Concierge is updating tag...',
        'Concierge is updating billable...',
        'Concierge is updating reimbursable...',
        'Concierge is updating date...',
        'Concierge is updating attendees...',
        'Concierge is updating tax amount...',
        'Concierge is updating tax rate...',
    ],
    preferenceUpdate: [
        'Concierge is updating company size...',
        'Concierge is updating integration preference...',
        'Concierge is updating card interest...',
        'Concierge is updating travel interest...',
    ],
    comment: ['Concierge is posting a comment...'],
    escalation: ['Concierge is escalating to a human...'],
};

function getFillerMessagesForLabel(statusLabel: string): string[] {
    for (const [poolName, labels] of Object.entries(STATUS_LABEL_GROUPS)) {
        if (labels.includes(statusLabel)) {
            return FILLER_MESSAGE_POOLS[poolName] ?? FILLER_MESSAGE_POOLS.generic;
        }
    }
    return FILLER_MESSAGE_POOLS.generic;
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
    const [serverLabelVersion, setServerLabelVersion] = useState(0);
    const [waitingSessionVersion, setWaitingSessionVersion] = useState<number | null>(null);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const fillerIndexRef = useRef<number>(0);
    const nextDelayRef = useRef<number>(INITIAL_FILLER_DELAY_MS);
    const baseLabelRef = useRef<string>(serverLabel ?? '');

    useEffect(() => {
        setServerLabelVersion((version) => version + 1);
    }, [reportNameValuePairs]);

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
        setWaitingSessionVersion(serverLabelVersion);
    }, [isConciergeChat, serverLabel, serverLabelVersion]);

    useEffect(() => {
        const hasServerUpdatedSinceKickoff = waitingSessionVersion !== null && serverLabelVersion !== waitingSessionVersion;
        if (!serverLabel || !hasServerUpdatedSinceKickoff) {
            return;
        }

        setOptimisticLabel(undefined);
        setWaitingSessionVersion(null);
    }, [serverLabel, serverLabelVersion, waitingSessionVersion]);

    useEffect(() => {
        clearTimer();

        if (!isConciergeChat) {
            setDisplayLabel(undefined);
            return;
        }

        if (optimisticLabel) {
            baseLabelRef.current = '';
            setDisplayLabel(optimisticLabel);
            return;
        }

        if (!serverLabel) {
            baseLabelRef.current = '';
            setDisplayLabel(undefined);
            return;
        }

        baseLabelRef.current = serverLabel;
        const fillerMessages = getFillerMessagesForLabel(serverLabel);
        fillerIndexRef.current = Math.floor(Math.random() * fillerMessages.length);
        nextDelayRef.current = INITIAL_FILLER_DELAY_MS;
        setDisplayLabel(serverLabel);

        const scheduleNextFiller = () => {
            const jitter = nextDelayRef.current * JITTER_RATIO;
            const randomJitter = (Math.random() * 2 - 1) * jitter;
            const delay = Math.min(MAX_FILLER_DELAY_MS, Math.max(INITIAL_FILLER_DELAY_MS, nextDelayRef.current + randomJitter));

            clearTimer();
            timerRef.current = setTimeout(() => {
                // A new server label arrived; abandon this filler loop.
                if (baseLabelRef.current !== serverLabel) {
                    return;
                }

                const messages = getFillerMessagesForLabel(baseLabelRef.current);
                const nextIndex = fillerIndexRef.current % messages.length;
                setDisplayLabel(messages.at(nextIndex));
                fillerIndexRef.current = (fillerIndexRef.current + 1) % messages.length;
                nextDelayRef.current = Math.min(MAX_FILLER_DELAY_MS, Math.round(nextDelayRef.current * BACKOFF_MULTIPLIER));
                scheduleNextFiller();
            }, delay);
        };

        scheduleNextFiller();

        return clearTimer;
    }, [clearTimer, isConciergeChat, optimisticLabel, serverLabel]);

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
