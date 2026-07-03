import useCallbackRef, {useRefMirror} from '@hooks/useCallbackRef';

import type {ReactNode} from 'react';

import React, {createContext, use, useEffect, useReducer, useRef} from 'react';

type PresenceLifecycle = 'mounted' | 'unmountSuspended' | 'unmounted';

type PresenceState = {
    readonly present: boolean;
    readonly state: PresenceLifecycle;
};

type PresenceActions = {
    readonly onAnimationEnd: () => void;
};

type PresenceContextValue = {
    readonly state: PresenceState;
    readonly actions: PresenceActions;
};

type PresenceProps = {
    /** Whether the content should be present; flipping to `false` runs the exit animation before unmounting */
    present: boolean;

    /** Called once the exit animation completes and the content is removed */
    onExitComplete?: () => void;

    /** Content whose mount/unmount is animated */
    children: ReactNode;
};

type PresenceAction = {type: 'present'; value: boolean} | {type: 'animationEnd'};

const PresenceContext = createContext<PresenceContextValue | null>(null);

function stepToExit(internal: PresenceLifecycle): PresenceLifecycle {
    return internal === 'mounted' ? 'unmountSuspended' : internal;
}

function presenceReducer(internal: PresenceLifecycle, action: PresenceAction): PresenceLifecycle {
    if (action.type === 'present') {
        return action.value ? 'mounted' : stepToExit(internal);
    }
    return internal === 'unmountSuspended' ? 'unmounted' : internal;
}

function derivePublishedState(present: boolean, internal: PresenceLifecycle): PresenceLifecycle {
    return present ? 'mounted' : stepToExit(internal);
}

function usePresence(consumerName: string): PresenceContextValue {
    const value = use(PresenceContext);
    if (!value) {
        throw new Error(`${consumerName} must be rendered inside <Presence>`);
    }
    return value;
}

// Fallback in case onAnimationEnd never fires — avoids stuck 'unmountSuspended'.
const MAX_PRESENCE_EXIT_MS = 2000;

function Presence({present, onExitComplete, children}: PresenceProps) {
    const [internal, dispatch] = useReducer(presenceReducer, present ? 'mounted' : 'unmounted');

    useEffect(() => {
        dispatch({type: 'present', value: present});
    }, [present]);

    const onExitCompleteRef = useRefMirror(onExitComplete);
    const owedRef = useRef(false);

    // owedRef gates onExitComplete to at-most-once (timer + animation can both fire).
    const handleAnimationEnd = useCallbackRef(() => {
        dispatch({type: 'animationEnd'});
    });

    const publishedState = derivePublishedState(present, internal);

    useEffect(() => {
        // onExitComplete fires from the effect (not the worklet handler) so it observes the committed publishedState.
        if (publishedState === 'unmounted') {
            if (owedRef.current) {
                owedRef.current = false;
                onExitCompleteRef.current?.();
            }
            return undefined;
        }
        if (publishedState !== 'unmountSuspended') {
            owedRef.current = false;
            return undefined;
        }
        owedRef.current = true;
        const timeoutId = setTimeout(handleAnimationEnd, MAX_PRESENCE_EXIT_MS);
        return () => clearTimeout(timeoutId);
    }, [publishedState, handleAnimationEnd, onExitCompleteRef]);

    useEffect(
        () => () => {
            if (!owedRef.current) {
                return;
            }
            owedRef.current = false;
            onExitCompleteRef.current?.();
        },
        [onExitCompleteRef],
    );

    if (publishedState === 'unmounted') {
        return null;
    }

    const value: PresenceContextValue = {
        state: {present, state: publishedState},
        actions: {onAnimationEnd: handleAnimationEnd},
    };

    return <PresenceContext value={value}>{children}</PresenceContext>;
}

export default Presence;
export {usePresence, PresenceContext};
export type {PresenceProps, PresenceContextValue, PresenceState, PresenceActions, PresenceLifecycle};
