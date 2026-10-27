import {releaseFlowDiscardPromptSuppression} from '@libs/Navigation/helpers/discardPromptState';

import type {RefObject} from 'react';

import {useRef, useState} from 'react';

type SubmitLock = {
    /** Whether the user has confirmed the expense, which disables the confirm button. */
    isConfirmed: boolean;

    /** Sets `isConfirmed` directly, for flows that confirm outside `lockSubmission` (e.g. send money's dismiss-first submit). */
    setIsConfirmed: (isConfirmed: boolean) => void;

    /** Set once a submission starts and never reset on its own, so the navigator can't double-submit while it moves away. */
    formHasBeenSubmitted: RefObject<boolean>;

    /** Hands the page back after a submit returned without writing, or every later tap is swallowed. */
    unlockSubmission: () => void;

    /** Marks the expense confirmed and takes the lock. Returns false when a submission already holds it. */
    lockSubmission: () => boolean;
};

/** Owns the confirmation's submit lock. */
function useSubmitLock(): SubmitLock {
    const [isConfirmed, setIsConfirmed] = useState(false);
    const formHasBeenSubmitted = useRef(false);

    const unlockSubmission = () => {
        formHasBeenSubmitted.current = false;
        setIsConfirmed(false);
        // The submit stays on the flow, so leaving it must prompt again
        releaseFlowDiscardPromptSuppression();
    };

    const lockSubmission = () => {
        setIsConfirmed(true);

        // Don't let the form be submitted multiple times while the navigator is waiting to take the user to a different page
        if (formHasBeenSubmitted.current) {
            return false;
        }

        formHasBeenSubmitted.current = true;
        return true;
    };

    return {isConfirmed, setIsConfirmed, formHasBeenSubmitted, unlockSubmission, lockSubmission};
}

export default useSubmitLock;
export type {SubmitLock};
