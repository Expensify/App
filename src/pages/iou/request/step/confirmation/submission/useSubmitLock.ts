import type {RefObject} from 'react';

import {useRef, useState} from 'react';

type SubmitLock = {
    /** Whether the user has confirmed the expense, which disables the confirm button. */
    isConfirmed: boolean;

    setIsConfirmed: (isConfirmed: boolean) => void;

    /** Set once a submission starts and never reset on its own, so the navigator can't double-submit while it moves away. */
    formHasBeenSubmitted: RefObject<boolean>;

    /** Hands the page back after a submit returned without writing, or every later tap is swallowed. */
    releaseSubmitLock: () => void;

    /** Marks the expense confirmed and takes the lock. Returns false when a submission already holds it. */
    acquireSubmitLock: () => boolean;
};

/**
 * Owns the confirmation's submit lock. It lives above the submission hooks because the page reads it too - the
 * destination pre-mount keeps its pre-inserted route only once a submission started.
 */
function useSubmitLock(): SubmitLock {
    const [isConfirmed, setIsConfirmed] = useState(false);
    const formHasBeenSubmitted = useRef(false);

    const releaseSubmitLock = () => {
        formHasBeenSubmitted.current = false;
        setIsConfirmed(false);
    };

    const acquireSubmitLock = () => {
        setIsConfirmed(true);

        // Don't let the form be submitted multiple times while the navigator is waiting to take the user to a different page
        if (formHasBeenSubmitted.current) {
            return false;
        }

        formHasBeenSubmitted.current = true;
        return true;
    };

    return {isConfirmed, setIsConfirmed, formHasBeenSubmitted, releaseSubmitLock, acquireSubmitLock};
}

export default useSubmitLock;
export type {SubmitLock};
