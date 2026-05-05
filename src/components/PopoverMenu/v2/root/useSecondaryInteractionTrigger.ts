import type {AnchorRef} from './RootContext';
import useAnchorOpener from './useAnchorOpener';

type UseSecondaryInteractionTriggerResult = {
    ref: AnchorRef;
    /** Parameterless to stay assignable to any pressable's `onSecondaryInteraction` signature. */
    onSecondaryInteraction: () => void;
};

/**
 * Returns `{ref, onSecondaryInteraction}` to attach to any pressable so a long-press (native) or
 * right-click (web) opens the enclosing `<Root>`'s popover. Mirror of `usePopoverTrigger` for the
 * secondary-interaction gesture.
 */
function useSecondaryInteractionTrigger(): UseSecondaryInteractionTriggerResult {
    const {ref, open} = useAnchorOpener('useSecondaryInteractionTrigger');
    return {ref, onSecondaryInteraction: open};
}

export default useSecondaryInteractionTrigger;
export type {UseSecondaryInteractionTriggerResult};
