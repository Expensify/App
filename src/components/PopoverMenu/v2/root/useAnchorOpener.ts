import {use, useRef} from 'react';
import type {View} from 'react-native';
import Log from '@libs/Log';
import {RootActionsContext} from './RootContext';
import type {AnchorRef} from './RootContext';

type UseAnchorOpenerResult = {
    ref: AnchorRef;
    open: () => void;
};

/**
 * Shared core of `usePopoverTrigger` / `useSecondaryInteractionTrigger`. Owns the anchor ref and
 * the measure-and-open state machine; the public hooks only rename `open` to the gesture-specific
 * prop (`onPress`, `onSecondaryInteraction`). Single source of truth for the Fabric vs. Old-Arch
 * measurement branching.
 */
function useAnchorOpener(callerName: string): UseAnchorOpenerResult {
    const actions = use(RootActionsContext);
    if (!actions) {
        throw new Error(`${callerName}() must be called inside <PopoverMenu.Root>.`);
    }
    const {setIsVisible, setActiveAnchor} = actions;
    const ownRef: AnchorRef = useRef<View | null>(null);

    const open = () => {
        const node = ownRef.current;
        if (!node) {
            return;
        }
        // Fabric: sync `getBoundingClientRect`. Old Arch / Paper / test renderer: async `measureInWindow`.
        if (typeof node.getBoundingClientRect === 'function') {
            const {x, y, width, height} = node.getBoundingClientRect();
            setActiveAnchor({ref: ownRef, rect: {x, y, width, height}});
            setIsVisible(true);
            return;
        }
        if (typeof node.measureInWindow === 'function') {
            node.measureInWindow((x, y, width, height) => {
                setActiveAnchor({ref: ownRef, rect: {x, y, width, height}});
                setIsVisible(true);
            });
            return;
        }
        // Unreachable in real runtimes (Fabric, Paper, web all expose at least one).
        Log.warn(`[${callerName}] anchor node exposes neither getBoundingClientRect nor measureInWindow`);
    };

    return {ref: ownRef, open};
}

export default useAnchorOpener;
export type {UseAnchorOpenerResult};
