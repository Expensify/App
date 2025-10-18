import {useEffect, useRef} from 'react';
import {removeHTMLClickableAction, setHTMLClickableAction} from '@libs/HTMLClickableActionsUtils';
import type {ClickableAction} from '@libs/HTMLClickableActionsUtils';

/**
 * Registers one or multiple HTML clickable actions and cleans them up when action change or
 * on component unmount.
 *
 * This hook performs a diff between the previous and current actions and only cleans up the keys
 * that changed. Callers do NOT need to memoize the actions object.
 */
function useHTMLClickableActions(actions?: Record<string, ClickableAction>) {
    const prevRef = useRef<Record<string, ClickableAction> | null>(null);

    useEffect(() => {
        const previousActions = prevRef.current ?? {};
        const currentActions = actions ?? {};

        // Register an actions that are new or has been changed
        for (const [id, action] of Object.entries(currentActions)) {
            if (!previousActions[id] || previousActions[id] !== action) {
                setHTMLClickableAction(id, action);
            }
        }

        // Remove actions from HTMLClickableActions that no longer exist
        for (const id of Object.keys(previousActions)) {
            if (!(id in currentActions)) {
                removeHTMLClickableAction(id);
            }
        }

        prevRef.current = currentActions;
        return () => {
            for (const id of Object.keys(currentActions)) {
                removeHTMLClickableAction(id);
            }
            prevRef.current = null;
        };
    }, [actions]);
}

export default useHTMLClickableActions;
